import mimetypes
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from django.urls import reverse
from core.upload_validation import (
    MESSAGE_EXTENSIONS,
    MESSAGE_UPLOAD_MAX_BYTES,
    PORTFOLIO_EXTENSIONS,
    PORTFOLIO_UPLOAD_MAX_BYTES,
    validate_upload,
)
from .models import Project, Proposal, ProjectMessage , Portfolio , ActivityLog , Rating


class ProjectBudgetValidationMixin:
    def validate(self, attrs):
        current_min = getattr(self.instance, "budget_min", None)
        current_max = getattr(self.instance, "budget_max", None)
        budget_min = attrs.get("budget_min", current_min)
        budget_max = attrs.get("budget_max", current_max)

        if budget_min is not None and budget_min < 1:
            raise serializers.ValidationError({"budget_min": "Must be greater than zero."})
        if budget_max is not None and budget_max < 1:
            raise serializers.ValidationError({"budget_max": "Must be greater than zero."})
        if budget_min is not None and budget_max is not None and budget_min > budget_max:
            raise serializers.ValidationError({"budget_max": "Must be greater than or equal to budget_min."})

        return attrs


class ProposalUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = ["id", "project", "freelancer", "message", "bid_amount", "status", "created_at"]
        read_only_fields = ["id", "project", "freelancer", "status", "created_at"]

    def validate_bid_amount(self, value):
        project = self.instance.project
        if project.budget_min is not None and value < project.budget_min:
            raise serializers.ValidationError("Bid is below the project minimum budget.")
        if project.budget_max is not None and value > project.budget_max:
            raise serializers.ValidationError("Bid exceeds the project maximum budget.")
        return value


class PrivateMessageAttachmentField(serializers.FileField):
    def to_representation(self, value):
        if not value:
            return None
        url = reverse("message-attachment", kwargs={"message_id": value.instance.pk})
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url


class ProjectMessageSerializer(serializers.ModelSerializer):
    attachment = PrivateMessageAttachmentField(required=False, allow_null=True)
    attachment_url = serializers.SerializerMethodField(read_only=True)
    attachment_name = serializers.SerializerMethodField(read_only=True)
    attachment_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProjectMessage
        fields = [
            "id",
            "project",
            "sender",
            "message",
            "attachment",
            "sticker",
            "created_at",
            "read",
            "attachment_url",
            "attachment_name",
            "attachment_type",
        ]
        read_only_fields = ["id", "sender", "created_at", "read"]

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        url = reverse("message-attachment", kwargs={"message_id": obj.id})
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_attachment_name(self, obj):
        return obj.attachment.name.rsplit("/", 1)[-1] if obj.attachment else None

    def get_attachment_type(self, obj):
        if not obj.attachment:
            return None
        return mimetypes.guess_type(obj.attachment.name)[0] or "application/octet-stream"

    def validate_attachment(self, value):
        try:
            validate_upload(
                value,
                max_bytes=MESSAGE_UPLOAD_MAX_BYTES,
                allowed_extensions=MESSAGE_EXTENSIONS,
            )
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from None
        return value
        
class ProposalCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), required=False)
    bid = serializers.IntegerField(required=False, min_value=1, write_only=True)
    price = serializers.IntegerField(required=False, min_value=1, write_only=True)
    cover_letter = serializers.CharField(required=False, write_only=True)
    message = serializers.CharField(required=False)
    bid_amount = serializers.IntegerField(required=False, min_value=1)

    class Meta:
        model = Proposal
        fields = ("id", "project", "message", "bid_amount", "cover_letter", "bid", "price")
        read_only_fields = ("id",)

    def validate(self, attrs):
        if "cover_letter" in attrs:
            if not attrs.get("message"):
                attrs["message"] = attrs.get("cover_letter")
            attrs.pop("cover_letter", None)

        if "bid" in attrs:
            if attrs.get("bid_amount") is None:
                attrs["bid_amount"] = attrs.get("bid")
            attrs.pop("bid", None)
        if "price" in attrs:
            if attrs.get("bid_amount") is None:
                attrs["bid_amount"] = attrs.get("price")
            attrs.pop("price", None)

        if not attrs.get("message"):
            raise serializers.ValidationError({"message": "This field is required."})
        if attrs.get("bid_amount") is None:
            raise serializers.ValidationError({"bid_amount": "This field is required."})

        project = attrs.get("project")
        if project is None:
            raise serializers.ValidationError({"project": "This field is required."})
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or user.user_type != "freelancer":
            raise PermissionDenied("Only freelancers can submit proposals.")
        if project.client_id == user.id:
            raise serializers.ValidationError({"project": "You cannot propose on your own project."})
        if project.status != "open":
            raise serializers.ValidationError({"project": "Proposals are only allowed for open projects."})
        if Proposal.objects.filter(project=project, freelancer=user).exists():
            raise serializers.ValidationError({"project": "You have already submitted a proposal for this project."})

        bid_amount = attrs["bid_amount"]
        if project.budget_min is not None and bid_amount < project.budget_min:
            raise serializers.ValidationError({"bid_amount": "Bid is below the project minimum budget."})
        if project.budget_max is not None and bid_amount > project.budget_max:
            raise serializers.ValidationError({"bid_amount": "Bid exceeds the project maximum budget."})

        return attrs

    def to_internal_value(self, data):
        mutable = data.copy() if hasattr(data, "copy") else dict(data)
        if not mutable.get("project"):
            mutable["project"] = mutable.get("project_id") or mutable.get("projectId")
        return super().to_internal_value(mutable)

    def create(self, validated_data):
        validated_data.pop("cover_letter", None)
        validated_data.pop("bid", None)
        validated_data.pop("price", None)

        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["freelancer"] = request.user
        return super().create(validated_data)


    
    
class ProjectSerializer(ProjectBudgetValidationMixin, serializers.ModelSerializer):
    has_applied = serializers.SerializerMethodField(read_only=True)
    user_proposal_id = serializers.SerializerMethodField(read_only=True)
    hired_freelancer = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["client", "created_at", "status", "hired_freelancer"]

    def get_has_applied(self, obj):
        if hasattr(obj, "has_applied"):
            return obj.has_applied
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            return Proposal.objects.filter(project=obj, freelancer=user).exists()
        return False

    def get_user_proposal_id(self, obj):
        if hasattr(obj, "user_proposal_id"):
            return obj.user_proposal_id
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            p = Proposal.objects.filter(project=obj, freelancer=user).first()
            return p.id if p else None
        return None

    def get_hired_freelancer(self, obj):
        if obj.hired_freelancer:
            return {"id": obj.hired_freelancer.id, "username": getattr(obj.hired_freelancer, "username", None)}
        return None

class ProjectCreateSerializer(ProjectBudgetValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('title', 'description', 'budget_min', 'budget_max', 'skills', 'category')

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            validated_data["client"] = request.user
        return super().create(validated_data)

class ProposalSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    project_status = serializers.CharField(source="project.status", read_only=True)

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

    def validate_media(self, value):
        if value is None:
            return value
        try:
            validate_upload(
                value,
                max_bytes=PORTFOLIO_UPLOAD_MAX_BYTES,
                allowed_extensions=PORTFOLIO_EXTENSIONS,
            )
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from None
        return value

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            validated_data["freelancer"] = request.user
        return super().create(validated_data)

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = "__all__"


class ConversationProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "budget_min",
            "budget_max",
            "category",
            "skills",
            "client",
            "hired_freelancer",
            "status",
            "created_at",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    project = ConversationProjectSerializer(read_only=True, source="*")
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["project", "last_message"]

    def get_last_message(self, obj):
        messages = getattr(obj, "latest_messages", ())
        if not messages:
            return None
        return ProjectMessageSerializer(messages[0], context=self.context).data
        
        
class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = "__all__"
        read_only_fields = ("from_user", "created_at")


class RatingCreateSerializer(serializers.Serializer):
    user_to = serializers.IntegerField(required=False)
    to_user = serializers.IntegerField(required=False)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    review = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        project = self.context["project"]
        request = self.context["request"]
        user = request.user
        user_to_id = attrs.get("user_to")
        to_user_id = attrs.get("to_user")

        if user_to_id is not None and to_user_id is not None and user_to_id != to_user_id:
            raise serializers.ValidationError({"user_to": "Conflicting recipient values."})
        recipient_id = user_to_id if user_to_id is not None else to_user_id
        if recipient_id is None:
            raise serializers.ValidationError({"user_to": "This field is required."})
        if project.status != "completed" or not project.hired_freelancer_id:
            raise serializers.ValidationError({"project": "Ratings are only allowed for completed projects with a hired freelancer."})
        if user not in (project.client, project.hired_freelancer):
            raise PermissionDenied("Only project participants can submit a rating.")

        recipient = get_user_model().objects.filter(pk=recipient_id).first()
        if recipient is None:
            raise serializers.ValidationError({"user_to": "User not found."})
        if recipient not in (project.client, project.hired_freelancer) or recipient == user:
            raise serializers.ValidationError({"user_to": "You can only rate the other project participant."})
        if Rating.objects.filter(project=project, from_user=user, to_user=recipient).exists():
            raise serializers.ValidationError({"user_to": "You have already rated this participant for this project."})

        attrs["recipient"] = recipient
        return attrs

    def create(self, validated_data):
        return Rating.objects.create(
            project=self.context["project"],
            from_user=self.context["request"].user,
            to_user=validated_data["recipient"],
            rating=validated_data["rating"],
            review=validated_data.get("review", ""),
        )