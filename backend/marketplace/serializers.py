from rest_framework import serializers
from .models import Project, Proposal, ProjectMessage , Portfolio , ActivityLog , Rating


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["client", "created_at", "status"]


class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ["freelancer", "created_at"]


class ProjectMessageSerializer(serializers.ModelSerializer):
    attachment_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProjectMessage
        fields = "__all__"
        read_only_fields = ["sender", "created_at"]

    def get_attachment_url(self, obj):
        request = self.context.get("request")
        if obj.attachment:
            try:
                return request.build_absolute_uri(obj.attachment.url)
            except Exception:
                return obj.attachment.url
        return None

    def validate_attachment(self, value):
        # max 100 MB
        max_bytes = 100 * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError("حجم فایل نباید بیشتر از 100 مگابایت باشد.")
        return value
        
class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('title', 'description', 'budget_min', 'budget_max', 'skills', 'category')

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            validated_data["client"] = request.user
        return super().create(validated_data)


class ProposalCreateSerializer(serializers.ModelSerializer):
    bid = serializers.IntegerField(required=False, write_only=True)
    cover_letter = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Proposal
        fields = ("id", "project", "message", "bid_amount", "cover_letter", "bid")
        read_only_fields = ("id",)

    def validate(self, attrs):
        if "cover_letter" in attrs:
            if not attrs.get("message"):
                attrs["message"] = attrs.get("cover_letter")
            attrs.pop("cover_letter", None)

        if "bid" in attrs:
            if not attrs.get("bid_amount"):
                attrs["bid_amount"] = attrs.get("bid")
            attrs.pop("bid", None)

        return attrs

    def create(self, validated_data):
        validated_data.pop("cover_letter", None)
        validated_data.pop("bid", None)

        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["freelancer"] = request.user
        return super().create(validated_data)


    
    
class ProjectSerializer(serializers.ModelSerializer):
    has_applied = serializers.SerializerMethodField(read_only=True)
    user_proposal_id = serializers.SerializerMethodField(read_only=True)
    hired_freelancer = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["client", "created_at", "status", "hired_freelancer"]

    def get_has_applied(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            return Proposal.objects.filter(project=obj, freelancer=user).exists()
        return False

    def get_user_proposal_id(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            p = Proposal.objects.filter(project=obj, freelancer=user).first()
            return p.id if p else None
        return None

    def get_hired_freelancer(self, obj):
        if obj.hired_freelancer:
            return {"id": obj.hired_freelancer.id, "username": getattr(obj.hired_freelancer, "username", None), "email": getattr(obj.hired_freelancer, "email", None)}
        return None

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('title', 'description', 'budget_min', 'budget_max', 'skills', 'category')

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            validated_data["client"] = request.user
        return super().create(validated_data)

class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ["freelancer", "created_at"]

        
class PortfolioSerializer(serializers.ModelSerializer):
    freelancer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Portfolio
        fields = ["id", "freelancer", "title", "description", "media", "created_at"]
        read_only_fields = ["id", "freelancer", "created_at"]

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            validated_data["freelancer"] = request.user
        return super().create(validated_data)

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = "__all__"
        
        
class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = "__all__"
        read_only_fields = ("from_user", "created_at")