from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from .models import Wallet, Proposal, ProjectMessage, Portfolio, Project, ActivityLog
from .serializers import PortfolioSerializer, ActivitySerializer


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
            sender__user_type="freelancer",
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