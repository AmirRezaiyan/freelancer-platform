from rest_framework import generics, permissions
from .models import Project, Proposal, ProjectMessage , Portfolio , Project, ActivityLog , Rating , Wallet
from .serializers import ProjectSerializer, ProposalSerializer, ProjectMessageSerializer , ProjectCreateSerializer , ProposalCreateSerializer , ProposalSerializer , PortfolioSerializer, RatingSerializer
from .permissions import IsClient, IsOwner
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, permissions
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.http import Http404


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def hire_proposal_view(request, proposal_id):
    proposal = get_object_or_404(Proposal, pk=proposal_id)
    project = proposal.project

    if project.client != request.user:
        return Response({"detail": "فقط کارفرما می‌تواند این کار را انجام دهد."}, status=status.HTTP_403_FORBIDDEN)

    if project.status != "open":
        return Response({"detail": "این پروژه قابل استخدام نیست (احتمالاً قبلاً استخدام شده یا بسته شده)."}, status=status.HTTP_400_BAD_REQUEST)

    proposal.status = "accepted"
    proposal.save()

    project.hired_freelancer = proposal.freelancer
    project.status = "in_progress"
    project.save()

    Proposal.objects.filter(project=project).exclude(pk=proposal.pk).update(status="rejected")

    ActivityLog.objects.create(user=request.user, action=f"Hired {proposal.freelancer.email} for project {project.title}")
    ActivityLog.objects.create(user=proposal.freelancer, action=f"Was hired for project {project.title}")

    return Response({"detail": "فریلنسر استخدام شد."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_user_view(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    
    if project.status != "completed":
        return Response({"detail": "پروژه هنوز تکمیل نشده است."}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    
    if user not in (project.client, project.hired_freelancer):
        return Response({"detail": "شما اجازه امتیاز دادن در این پروژه را ندارید."}, status=status.HTTP_403_FORBIDDEN)

    user_to_id = request.data.get("user_to") or request.data.get("to_user")
    rating_val = request.data.get("rating")
    review = request.data.get("review", "")

    if not user_to_id or rating_val is None:
        return Response({"detail": "پارامترهای `user_to` و `rating` لازم است."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        to_user = get_user_model().objects.get(pk=int(user_to_id))
    except Exception:
        return Response({"detail": "کاربر هدف یافت نشد."}, status=status.HTTP_400_BAD_REQUEST)

    if to_user not in (project.client, project.hired_freelancer):
        return Response({"detail": "فقط می‌توانید به طرف مقابل پروژه امتیاز دهید."}, status=status.HTTP_400_BAD_REQUEST)

    if to_user == user:
        return Response({"detail": "نمی‌توانید به خودتان امتیاز دهید."}, status=status.HTTP_400_BAD_REQUEST)

    existing_rating = Rating.objects.filter(
        project=project,
        from_user=user,
        to_user=to_user
    ).first()
    
    if existing_rating:
        return Response({"detail": "شما قبلاً به این کاربر در این پروژه امتیاز داده‌اید."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        rating_val = int(rating_val)
    except:
        return Response({"detail": "rating باید عدد صحیح باشد."}, status=status.HTTP_400_BAD_REQUEST)

    if rating_val < 1 or rating_val > 5:
        return Response({"detail": "rating باید بین 1 و 5 باشد."}, status=status.HTTP_400_BAD_REQUEST)

    r = Rating.objects.create(
        project=project,
        from_user=user,
        to_user=to_user,
        rating=rating_val,
        review=review
    )
    
    ActivityLog.objects.create(
        user=user, 
        action=f"Rated {to_user.email} for project {project.title}: {rating_val}"
    )
    
    return Response({"id": r.id, "detail": "امتیاز با موفقیت ثبت شد."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_proposal_view(request, proposal_id):
    proposal = get_object_or_404(Proposal, pk=proposal_id)
    project = proposal.project

    if project.client != request.user:
        return Response({"detail": "فقط کارفرما می‌تواند این کار را انجام دهد."}, status=status.HTTP_403_FORBIDDEN)

    if proposal.status == "accepted":
        return Response({"detail": "این پروپوزال قبلاً تایید شده و قابل رد نیست."}, status=status.HTTP_400_BAD_REQUEST)

    proposal.status = "rejected"
    proposal.save()
    ActivityLog.objects.create(user=request.user, action=f"Rejected proposal {proposal.id} for project {project.title}")
    return Response({"detail": "پیشنهاد رد شد."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def project_mark_completed_view(request, project_id):
    project = get_object_or_404(Project, pk=project_id)

    if project.client != request.user:
        return Response({"detail": "فقط کارفرما می‌تواند پروژه را تکمیل کند."}, status=status.HTTP_403_FORBIDDEN)

    if project.status != "in_progress":
        return Response({"detail": "پروژه در وضعیت مناسب (in_progress) نیست."}, status=status.HTTP_400_BAD_REQUEST)

    project.status = "completed"
    project.save()
    if project.hired_freelancer:
        ActivityLog.objects.create(user=project.hired_freelancer, action=f"Project completed: {project.title}")
    ActivityLog.objects.create(user=request.user, action=f"Marked project completed: {project.title}")

    return Response({"detail": "پروژه به عنوان تکمیل شده علامت‌گذاری شد."})



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def proposal_create_view(request):
    data = request.data or {}
    project_id = data.get("project") or data.get("project_id") or data.get("projectId")
    if not project_id:
        return Response({"detail": "project id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return Response({"detail": "project not found"}, status=status.HTTP_404_NOT_FOUND)

    if Proposal.objects.filter(project=project, freelancer=request.user).exists():
        return Response({"detail": "شما قبلاً برای این پروژه پیشنهاد داده‌اید."}, status=status.HTTP_400_BAD_REQUEST)

    user_model = get_user_model()
    project_field_name = None
    freelancer_field_name = None
    for f in Proposal._meta.get_fields():
        if getattr(f, "remote_field", None) and getattr(f.remote_field, "model", None) is Project:
            project_field_name = f.name
        if getattr(f, "remote_field", None) and getattr(f.remote_field, "model", None) is user_model:
            freelancer_field_name = f.name

    project_field_name = project_field_name or ("project" if "project" in [f.name for f in Proposal._meta.fields] else None)
    freelancer_field_name = freelancer_field_name or ("freelancer" if "freelancer" in [f.name for f in Proposal._meta.fields] else None)

    create_kwargs = {}
    model_field_names = {f.name for f in Proposal._meta.fields}

    alias_map = {
        "cover_letter": ["cover_letter", "message", "content", "text", "note"],
        "bid": ["bid", "amount", "price", "offer", "bid_amount"],
    }

    for key, value in data.items():
        if key in model_field_names and key not in (project_field_name, freelancer_field_name):
            create_kwargs[key] = value

    for src, candidates in alias_map.items():
        if src in data:
            for cand in candidates:
                if cand in model_field_names and cand not in (project_field_name, freelancer_field_name):
                    create_kwargs[cand] = data[src]
                    break

    create_kwargs[project_field_name] = project
    create_kwargs[freelancer_field_name] = request.user

    try:
        proposal = Proposal.objects.create(**create_kwargs)
    except Exception as exc:
        return Response({"detail": "failed to create proposal", "error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"id": proposal.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    data = {}

    if user.user_type == "client":
        projects = Project.objects.filter(client=user)
        proposals_received = Proposal.objects.filter(project__in=projects)
        
        data['counts'] = {
            "projects_total": projects.count(),
            "proposals_received": proposals_received.count(),
            "in_progress": projects.filter(status="in_progress").count(),
        }

    elif user.user_type == "freelancer":
        proposals_sent = Proposal.objects.filter(freelancer=user)
        earnings = proposals_sent.filter(status="accepted").aggregate(total=Sum("bid_amount"))["total"] or 0
        active_contracts = proposals_sent.filter(status="accepted").count()

        data['counts'] = {
            "proposals_sent": proposals_sent.count(),
            "active_contracts": active_contracts,
            "earnings": earnings,
        }

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def project_create_view(request):
    serializer = ProjectCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        project = serializer.save()
        return Response({"id": project.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsClient]  
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsOwner()]
        return [permissions.AllowAny()]


class ProposalCreateView(generics.CreateAPIView):
    serializer_class = ProposalCreateSerializer  
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        project = serializer.validated_data.get("project")
        if not project:
            project_id = self.request.data.get("project") or self.request.data.get("project_id")
            if project_id:
                try:
                    project = Project.objects.get(pk=project_id)
                except Project.DoesNotExist:
                    raise PermissionDenied(detail="پروژه یافت نشد.")
            else:
                raise PermissionDenied(detail="project is required.")

        if Proposal.objects.filter(project=project, freelancer=user).exists():
            raise PermissionDenied(detail="شما قبلاً برای این پروژه پیشنهاد ارسال کرده‌اید.")

        serializer.save(freelancer=user)


class ProposalListView(generics.ListAPIView):
    serializer_class = ProposalSerializer

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        return Proposal.objects.filter(project_id=project_id)

class MyProposalsListView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Proposal.objects.filter(freelancer=user).order_by("-created_at")

class ProjectMessageCreateView(generics.CreateAPIView):
    serializer_class = ProjectMessageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        sender = self.request.user

        # اگر پروژه هنوز هیچ فریلنسر استخدام‌شده ندارد -> پیام ممنوع
        if not project.hired_freelancer:
            raise PermissionDenied("ارتباط فقط پس از استخدام فعال می‌شود.")

        # فقط کارفرما یا فریلنسر استخدام‌شده می‌توانند پیام ارسال کنند
        if sender != project.client and sender != project.hired_freelancer:
            raise PermissionDenied("شما اجازه ارسال پیام برای این پروژه را ندارید.")

        serializer.save(sender=sender)


class ProjectMessageListView(generics.ListAPIView):
    serializer_class = ProjectMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, pk=self.kwargs["project_id"])
        user = self.request.user
        if user != project.client and user != project.hired_freelancer:
            raise Http404
        return ProjectMessage.objects.filter(project=project).order_by("created_at")


class PortfolioListCreateView(generics.ListCreateAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Portfolio.objects.filter(freelancer=self.request.user)

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
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        obj = get_object_or_404(Portfolio, pk=self.kwargs.get("pk"))
        if self.request.method in ("GET",):
            return obj
        if obj.freelancer != self.request.user:
            raise Http404
        return obj


class FreelancerCompletedProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(hired_freelancer=user, status="completed").order_by("-created_at")
    
    
class RatingListView(generics.ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_to_id = self.request.query_params.get('user_to')
        if user_to_id:
            return Rating.objects.filter(to_user_id=user_to_id)
        return Rating.objects.all()
    
    
class UserRatingsView(generics.ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Rating.objects.filter(to_user_id=user_id).order_by('-created_at')
    
    
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
    project = Project.objects.get(pk=project_id)
    if project.client != request.user:
        return Response({"detail": "دسترسی غیرمجاز"}, status=403)
    updated = ProjectMessage.objects.filter(
        project=project,
        sender__user_type="freelancer",
        read=False
    ).update(read=True)
    return Response({"updated": updated})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_project_messages_read(request, project_id):
    project = Project.objects.get(pk=project_id)
    if project.client != request.user:
        return Response({"detail": "دسترسی غیرمجاز"}, status=403)
    updated = ProjectMessage.objects.filter(
        project=project,
        sender__user_type="freelancer",
        read=False
    ).update(read=True)
    return Response({"updated": updated})