from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
        return Response({
            "total": Proposal.objects.filter(freelancer=user).count(),
            "pending": Proposal.objects.filter(freelancer=user, status="pending").count(),
            "accepted": Proposal.objects.filter(freelancer=user, status="accepted").count(),
            "rejected": Proposal.objects.filter(freelancer=user, status="rejected").count(),
        })


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
            total = Project.objects.filter(hired_freelancer=user).count()
            active = Project.objects.filter(hired_freelancer=user, status="in_progress").count()
            completed = Project.objects.filter(hired_freelancer=user, status="completed").count()
        else:
            total = Project.objects.filter(client=user).count()
            active = Project.objects.filter(client=user, status="in_progress").count()
            completed = Project.objects.filter(client=user, status="completed").count()
        return Response({
            "total": total,
            "active": active,
            "completed": completed,
        })


class PortfolioLimitedView(ListAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 3))
        return Portfolio.objects.filter(freelancer=self.request.user)[:limit]


class RecentActivityView(ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 5))
        return ActivityLog.objects.filter(user=self.request.user)[:limit]