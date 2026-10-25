from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Exists, F, OuterRef, Q, Subquery

from .models import Wallet, Proposal, ProjectMessage, Portfolio, Project, ActivityLog
from .serializers import ActivitySerializer, PortfolioSerializer, ProjectSerializer


class WalletBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        return Response({"balance": wallet.balance})


class ProposalStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        counts = Proposal.objects.filter(freelancer=user).aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status="pending")),
            accepted=Count("id", filter=Q(status="accepted")),
            rejected=Count("id", filter=Q(status="rejected")),
        )
        return Response(counts)


class UnreadMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        unread = ProjectMessage.objects.filter(
            project__client=request.user,
            sender_id=F("project__hired_freelancer_id"),
            read=False
        ).count()
        return Response({"unread": unread})


class ProjectStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if hasattr(user, 'user_type') and user.user_type == "freelancer":
            projects = Project.objects.filter(hired_freelancer=user)
        else:
            projects = Project.objects.filter(client=user)
        counts = projects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(status="in_progress")),
            completed=Count("id", filter=Q(status="completed")),
        )
        return Response(counts)


class EmployerProjectsView(ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_proposals = Proposal.objects.filter(project_id=OuterRef("pk"), freelancer_id=user.pk)
        queryset = Project.objects.filter(client=user).select_related(
            "client", "hired_freelancer"
        ).annotate(
            has_applied=Exists(user_proposals),
            user_proposal_id=Subquery(user_proposals.values("pk")[:1]),
        )
        status_filter = self.request.query_params.get("status")
        search_term = self.request.query_params.get("q")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search_term:
            queryset = queryset.filter(Q(title__icontains=search_term) | Q(description__icontains=search_term))
        return queryset.order_by("-created_at", "-pk")


class PortfolioLimitedView(ListAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    @staticmethod
    def _limit(request, default):
        try:
            requested = int(request.query_params.get("limit", default))
        except (TypeError, ValueError):
            return default
        return min(max(requested, 1), 50)

    def get_queryset(self):
        limit = self._limit(self.request, 3)
        return Portfolio.objects.filter(freelancer=self.request.user).order_by("-created_at", "-pk")[:limit]


class RecentActivityView(ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        limit = PortfolioLimitedView._limit(self.request, 5)
        return ActivityLog.objects.filter(user=self.request.user).order_by("-created_at", "-pk")[:limit]