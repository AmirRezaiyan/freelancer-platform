from rest_framework import generics, permissions, status
from .models import Project, Proposal, ProjectMessage , Portfolio , ActivityLog , Rating , Wallet
from .serializers import ConversationSerializer, ProjectSerializer, ProposalSerializer, ProposalUpdateSerializer, ProjectMessageSerializer , ProjectCreateSerializer , ProposalCreateSerializer , PortfolioSerializer, RatingSerializer, RatingCreateSerializer
from .permissions import IsClient, IsFreelancer, IsOwner
from users.profile_completion import require_profile_completion
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Count, Exists, F, OuterRef, Prefetch, Q, Subquery, Sum
from django.conf import settings
from django.core.files import File
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.utils.text import get_valid_filename
from pathlib import Path
from core.upload_validation import MESSAGE_EXTENSIONS, MESSAGE_UPLOAD_MAX_BYTES, validate_upload
import traceback
import logging


logger = logging.getLogger(__name__)


def create_proposal_with_project_lock(serializer, user):
    validated_project = serializer.validated_data["project"]
    with transaction.atomic():
        try:
            project = Project.objects.select_for_update().get(pk=validated_project.pk)
        except Project.DoesNotExist:
            raise ValidationError({"project": "This project is no longer available."}) from None

        if project.status != "open":
            raise ValidationError({"project": "Proposals are only allowed for open projects."})
        if project.client_id == user.pk:
            raise ValidationError({"project": "You cannot propose on your own project."})

        bid_amount = serializer.validated_data["bid_amount"]
        if project.budget_min is not None and bid_amount < project.budget_min:
            raise ValidationError({"bid_amount": "Bid is below the project minimum budget."})
        if project.budget_max is not None and bid_amount > project.budget_max:
            raise ValidationError({"bid_amount": "Bid exceeds the project maximum budget."})
        if Proposal.objects.filter(project=project, freelancer=user).exists():
            raise ValidationError({"project": "You have already submitted a proposal for this project."})

        require_profile_completion(user, "submit_proposal")
        return serializer.save(project=project, freelancer=user)


def log_proposal_creation_failure(exc):
    failure_frame = traceback.extract_tb(exc.__traceback__)[-1]
    logger.error(
        "Proposal creation failed (exception_type=%s at %s:%s)",
        type(exc).__name__,
        failure_frame.name,
        failure_frame.lineno,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def hire_proposal_view(request, proposal_id):
    project_id = Proposal.objects.filter(pk=proposal_id).values_list("project_id", flat=True).first()
    if project_id is None:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        with transaction.atomic():
            project = get_object_or_404(Project.objects.select_for_update(), pk=project_id)
            proposal = get_object_or_404(Proposal.objects.select_for_update(), pk=proposal_id, project=project)

            if project.client_id != request.user.id:
                return Response({"detail": "فقط کارفرما می‌تواند این کار را انجام دهد."}, status=status.HTTP_403_FORBIDDEN)
            if project.status != "open":
                return Response({"detail": "این پروژه قابل استخدام نیست (احتمالاً قبلاً استخدام شده یا بسته شده)."}, status=status.HTTP_400_BAD_REQUEST)
            if proposal.status != "pending":
                return Response({"detail": "فقط پیشنهادهای در انتظار قابل استخدام هستند."}, status=status.HTTP_400_BAD_REQUEST)

            proposal.status = "accepted"
            proposal.save(update_fields=["status"])

            project.hired_freelancer = proposal.freelancer
            project.status = "in_progress"
            project.save(update_fields=["hired_freelancer", "status"])

            Proposal.objects.filter(project=project).exclude(pk=proposal.pk).update(status="rejected")

            ActivityLog.objects.create(user=request.user, action=f"Hired {proposal.freelancer.email} for project {project.title}")
            ActivityLog.objects.create(user=proposal.freelancer, action=f"Was hired for project {project.title}")
    except IntegrityError:
        return Response(
            {"detail": "This project already has an accepted proposal."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"detail": "فریلنسر استخدام شد."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_user_view(request, project_id):
    project = get_object_or_404(Project, pk=project_id)

    serializer = RatingCreateSerializer(
        data=request.data,
        context={"request": request, "project": project},
    )
    serializer.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            rating = serializer.save()
            ActivityLog.objects.create(
                user=request.user,
                action=f"Rated {rating.to_user.email} for project {project.title}: {rating.rating}",
            )
    except IntegrityError:
        return Response(
            {"detail": "You have already rated this participant for this project."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"id": rating.id, "detail": "امتیاز با موفقیت ثبت شد."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_proposal_view(request, proposal_id):
    project_id = Proposal.objects.filter(pk=proposal_id).values_list("project_id", flat=True).first()
    if project_id is None:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

    with transaction.atomic():
        project = get_object_or_404(Project.objects.select_for_update(), pk=project_id)
        proposal = get_object_or_404(Proposal.objects.select_for_update(), pk=proposal_id, project=project)

        if project.client_id != request.user.id:
            return Response({"detail": "فقط کارفرما می‌تواند این کار را انجام دهد."}, status=status.HTTP_403_FORBIDDEN)
        if project.status != "open" or proposal.status != "pending":
            return Response({"detail": "فقط پیشنهادهای در انتظار پروژه‌های باز قابل رد هستند."}, status=status.HTTP_400_BAD_REQUEST)

        proposal.status = "rejected"
        proposal.save(update_fields=["status"])
        ActivityLog.objects.create(user=request.user, action=f"Rejected proposal {proposal.id} for project {project.title}")

    return Response({"detail": "پیشنهاد رد شد."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def project_mark_completed_view(request, project_id):
    with transaction.atomic():
        project = get_object_or_404(Project.objects.select_for_update(), pk=project_id)
        if project.client_id != request.user.pk:
            return Response({"detail": "فقط کارفرما می‌تواند پروژه را تکمیل کند."}, status=status.HTTP_403_FORBIDDEN)

        if project.status != "in_progress":
            return Response({"detail": "پروژه در وضعیت مناسب (in_progress) نیست."}, status=status.HTTP_400_BAD_REQUEST)

        project.status = "completed"
        project.save(update_fields=["status"])
        if project.hired_freelancer_id:
            ActivityLog.objects.create(user_id=project.hired_freelancer_id, action=f"Project completed: {project.title}")
        ActivityLog.objects.create(user=request.user, action=f"Marked project completed: {project.title}")

    return Response({"detail": "پروژه به عنوان تکمیل شده علامت‌گذاری شد."})



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def proposal_create_view(request):
    serializer = ProposalCreateSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    try:
        proposal = create_proposal_with_project_lock(serializer, request.user)
    except IntegrityError:
        return Response(
            {"detail": "You have already submitted a proposal for this project."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except APIException:
        raise
    except ValidationError:
        raise
    except Exception as exc:
        log_proposal_creation_failure(exc)
        return Response(
            {"detail": "Unable to create proposal."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"id": proposal.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    data = {}

    if user.user_type == "client":
        projects = Project.objects.filter(client=user)
        project_counts = projects.aggregate(
            projects_total=Count("id"),
            in_progress=Count("id", filter=Q(status="in_progress")),
        )
        proposal_count = Proposal.objects.filter(project__client=user).count()
        data["counts"] = {**project_counts, "proposals_received": proposal_count}

    elif user.user_type == "freelancer":
        proposals_sent = Proposal.objects.filter(freelancer=user)
        proposal_counts = proposals_sent.aggregate(
            proposals_sent=Count("id"),
            active_contracts=Count("id", filter=Q(status="accepted")),
            earnings=Sum("bid_amount", filter=Q(status="accepted")),
        )
        proposal_counts["earnings"] = proposal_counts["earnings"] or 0
        data["counts"] = proposal_counts

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def project_create_view(request):
    require_profile_completion(request.user, "create_project")
    serializer = ProjectCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        project = serializer.save()
        return Response({"id": project.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsClient]

    def get_queryset(self):
        queryset = Project.objects.select_related("hired_freelancer")
        user = self.request.user
        if user.is_authenticated:
            user_proposals = Proposal.objects.filter(project_id=OuterRef("pk"), freelancer_id=user.pk)
            queryset = queryset.annotate(
                has_applied=Exists(user_proposals),
                user_proposal_id=Subquery(user_proposals.values("pk")[:1]),
            )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        search_term = self.request.query_params.get("q")
        if search_term:
            queryset = queryset.filter(Q(title__icontains=search_term) | Q(description__icontains=search_term))
        return queryset.order_by("-created_at", "-pk")

    def perform_create(self, serializer):
        require_profile_completion(self.request.user, "create_project")
        serializer.save(client=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.select_related("hired_freelancer")
        user = self.request.user
        if user.is_authenticated:
            user_proposals = Proposal.objects.filter(project_id=OuterRef("pk"), freelancer_id=user.pk)
            queryset = queryset.annotate(
                has_applied=Exists(user_proposals),
                user_proposal_id=Subquery(user_proposals.values("pk")[:1]),
            )
        return queryset

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsOwner()]
        return [permissions.AllowAny()]


class ProposalCreateView(generics.CreateAPIView):
    serializer_class = ProposalCreateSerializer  
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        try:
            create_proposal_with_project_lock(serializer, user)
        except IntegrityError:
            raise ValidationError({"project": "You have already submitted a proposal for this project."}) from None
        except ValidationError:
            raise
        except APIException:
            raise
        except Exception as exc:
            log_proposal_creation_failure(exc)
            raise APIException("Unable to create proposal.") from None


class ProposalListView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        project = get_object_or_404(Project, pk=project_id)
        user = self.request.user
        base_qs = Proposal.objects.select_related("project").order_by("-created_at", "-pk")
        if project.client_id == user.id:
            return base_qs.filter(project=project)
        if user.user_type == "freelancer":
            return base_qs.filter(project=project, freelancer=user)
        return base_qs.none()

class MyProposalsListView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Proposal.objects.filter(freelancer=user).select_related("project").order_by("-created_at", "-pk")


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProposalUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Proposal.objects.filter(freelancer=self.request.user)

    def _get_locked_pending_proposal(self, proposal_id):
        project_id = Proposal.objects.filter(
            pk=proposal_id,
            freelancer_id=self.request.user.pk,
        ).values_list("project_id", flat=True).first()
        if project_id is None:
            raise Http404

        project = get_object_or_404(Project.objects.select_for_update(), pk=project_id)
        proposal = get_object_or_404(
            Proposal.objects.select_for_update().select_related("project"),
            pk=proposal_id,
            project_id=project.pk,
            freelancer_id=self.request.user.pk,
        )
        if project.status != "open":
            raise ValidationError({"project": "Only proposals for open projects can be changed."})
        if proposal.status != "pending":
            raise PermissionDenied("Only pending proposals can be changed.")
        return proposal

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        with transaction.atomic():
            instance = self._get_locked_pending_proposal(kwargs["pk"])
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        with transaction.atomic():
            instance = self._get_locked_pending_proposal(kwargs["pk"])
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectMessageCreateView(generics.CreateAPIView):
    serializer_class = ProjectMessageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        sender = self.request.user

        if not project.hired_freelancer:
            raise PermissionDenied("ارتباط فقط پس از استخدام فعال می‌شود.")

        if sender != project.client and sender != project.hired_freelancer:
            raise PermissionDenied("شما اجازه ارسال پیام برای این پروژه را ندارید.")

        participants = (project.client_id, project.hired_freelancer_id)
        conversation_exists = ProjectMessage.objects.filter(
            project_id=project.pk,
            sender_id__in=participants,
        ).exists()
        if not conversation_exists:
            require_profile_completion(sender, "initiate_chat")

        serializer.save(sender=sender)


class ProjectMessageListView(generics.ListAPIView):
    serializer_class = ProjectMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, pk=self.kwargs["project_id"])
        user = self.request.user
        if user.pk not in (project.client_id, project.hired_freelancer_id):
            raise Http404
        return ProjectMessage.objects.filter(project=project).order_by("-created_at", "-pk")


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        latest_messages = ProjectMessage.objects.order_by("-created_at", "-pk")[:1]
        projects = Project.objects.prefetch_related(
            Prefetch("messages", queryset=latest_messages, to_attr="latest_messages")
        ).order_by("-created_at", "-pk")
        if user.user_type == "client":
            return projects.filter(client_id=user.pk, hired_freelancer__isnull=False)
        if user.user_type == "freelancer":
            return projects.filter(hired_freelancer_id=user.pk)
        return projects.none()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def message_attachment_view(request, message_id):
    message = get_object_or_404(ProjectMessage.objects.select_related("project"), pk=message_id)
    if request.user not in (message.project.client, message.project.hired_freelancer):
        raise Http404
    if not message.attachment:
        raise Http404

    try:
        file_handle = message.attachment.open("rb")
    except (FileNotFoundError, OSError):
        legacy_root = (Path(settings.MEDIA_ROOT) / "messages").resolve()
        legacy_path = (legacy_root / Path(message.attachment.name).name).resolve()
        try:
            legacy_path.relative_to(legacy_root)
        except ValueError:
            raise Http404
        if not legacy_path.is_file():
            raise Http404
        file_handle = legacy_path.open("rb")

    try:
        content_type = validate_upload(
            File(file_handle, name=message.attachment.name),
            max_bytes=MESSAGE_UPLOAD_MAX_BYTES,
            allowed_extensions=MESSAGE_EXTENSIONS,
        )
    except ValueError:
        file_handle.close()
        return Response({"detail": "Attachment is unavailable or no longer meets upload policy."}, status=415)

    file_handle.seek(0)
    filename = get_valid_filename(Path(message.attachment.name).name) or "attachment"
    response = FileResponse(
        file_handle,
        as_attachment=not content_type.startswith("image/"),
        filename=filename,
        content_type=content_type,
    )
    response["X-Content-Type-Options"] = "nosniff"
    response["Cache-Control"] = "private, no-store"
    return response


class PortfolioListCreateView(generics.ListCreateAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated, IsFreelancer]

    def get_queryset(self):
        return Portfolio.objects.filter(freelancer=self.request.user).order_by("-created_at", "-pk")

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)
        
    def perform_update(self, serializer):
        portfolio = self.get_object()
        if portfolio.freelancer != self.request.user:
            raise PermissionDenied("شما اجازه ویرایش این نمونه کار را ندارید.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.freelancer != self.request.user:
            raise PermissionDenied("شما اجازه حذف این نمونه کار را ندارید.")
        instance.delete()
        
        
class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsFreelancer]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        obj = get_object_or_404(Portfolio, pk=self.kwargs.get("pk"))
        if self.request.method in permissions.SAFE_METHODS:
            return obj
        if obj.freelancer != self.request.user:
            raise Http404
        return obj


class FreelancerCompletedProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(hired_freelancer=user, status="completed").order_by("-created_at", "-pk")
    
    
class RatingListView(generics.ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_to_id = self.request.query_params.get('user_to')
        from_user_id = self.request.query_params.get("from_user")
        queryset = Rating.objects.all()
        if from_user_id:
            if str(self.request.user.pk) != from_user_id:
                return queryset.none()
            queryset = queryset.filter(from_user_id=self.request.user.pk)
        if user_to_id:
            queryset = queryset.filter(to_user_id=user_to_id)
        return queryset.order_by("-created_at", "-pk")
    
    
class UserRatingsView(generics.ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Rating.objects.filter(to_user_id=user_id).order_by("-created_at", "-pk")
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_balance_view(request):
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    return Response({"balance": wallet.balance})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def proposal_stats_view(request):
    user = request.user
    proposals = Proposal.objects.filter(freelancer=user)
    return Response({
        "total": proposals.count(),
        "pending": proposals.filter(status="pending").count(),
        "accepted": proposals.filter(status="accepted").count(),
        "rejected": proposals.filter(status="rejected").count(),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_stats_view(request):
    user = request.user
    if user.user_type == "client":
        projects = Project.objects.filter(client=user)
    else:
        projects = Project.objects.filter(hired_freelancer=user)
    
    return Response({
        "total": projects.count(),
        "active": projects.filter(status="in_progress").count(),
        "completed": projects.filter(status="completed").count(),
    })
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_project_messages_read(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    if project.client_id != request.user.pk:
        return Response({"detail": "دسترسی غیرمجاز"}, status=403)
    updated = ProjectMessage.objects.filter(
        project=project,
        sender_id=project.hired_freelancer_id,
        read=False
    ).update(read=True)
    return Response({"updated": updated})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_project_messages_read(request):
    if request.user.user_type != "client":
        return Response({"detail": "Only clients can mark project messages as read."}, status=status.HTTP_403_FORBIDDEN)
    updated = ProjectMessage.objects.filter(
        project__client_id=request.user.pk,
        sender_id=F("project__hired_freelancer_id"),
        read=False,
    ).update(read=True)
    return Response({"updated": updated})
