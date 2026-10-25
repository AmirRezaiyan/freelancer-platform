from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from core.upload_validation import AVATAR_EXTENSIONS, AVATAR_UPLOAD_MAX_BYTES, validate_upload
from django.utils.translation import gettext_lazy as _
from .profile_completion import get_profile_completion
import json
import collections.abc
import re

User = get_user_model()

def _clean_avatar_value(raw_value, request=None):
    if not raw_value:
        return None

    try:
        if hasattr(raw_value, "url"):
            url = raw_value.url
        else:
            url = str(raw_value)
    except Exception:
        url = str(raw_value)

    if not url:
        return None

    url = url.strip()
    lc = url.lower()

    if "<" in url or "doctype" in lc or "<html" in lc:
        return None

    if lc.startswith("data:image/"):
        return url

    def build_if_relative(u):
        if request and u.startswith("/"):
            try:
                return request.build_absolute_uri(u)
            except Exception:
                return u
        return u

    if re.search(r"\.(png|jpg|jpeg|webp|avif|gif|svg)(\?.*)?$", lc):
        return build_if_relative(url)

    media_indicators = ("/media/avatars/", "/avatars/", "/media/profile_pics/", "/uploads/", "/media/", "/images/")
    if any(ind in lc for ind in media_indicators):
        if re.search(r"/users?/|/profile/|/dashboard/|/account/|/accounts?/", lc):
            return None
        return build_if_relative(url)

    if lc.startswith("http://") or lc.startswith("https://"):
        if re.search(r"\.(png|jpg|jpeg|webp|avif|gif|svg)(\?.*)?$", lc) or any(ind in lc for ind in media_indicators):
            if re.search(r"/users?/|/profile/|/dashboard/|/account/|/accounts?/", lc):
                return None
            return url
        return None

    return None



class PrivateUserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "display_name",
            "email",
            "user_type",
            "first_name",
            "last_name",
            "avatar",
            "skills",
            "languages",
            "business_fields",
            "company_size",
            "website",
            "company_description",
            "experience_years",
            "bio",
            "phone",
            "rating",
            "created_at",
        ]
        read_only_fields = ["id", "display_name", "email", "user_type", "rating", "created_at"]

    def get_display_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.email.split("@")[0]

    def get_avatar(self, obj):
        request = self.context.get("request") if isinstance(self.context, dict) else None
        return _clean_avatar_value(getattr(obj, "avatar", None), request=request)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "user_type"]

    def validate(self, attrs):
        user = User(email=attrs.get("email"), user_type=attrs.get("user_type"))
        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from None
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError(_("ایمیل و رمز عبور لازم است"))

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            make_password(password)
            raise serializers.ValidationError(_("ایمیل یا رمز عبور اشتباه است"))

        password_matches = user_obj.check_password(password)
        if not password_matches or not user_obj.is_active:
            raise serializers.ValidationError(_("ایمیل یا رمز عبور اشتباه است"))

        attrs["user"] = user_obj
        return attrs


class PublicUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()  

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "user_type",
            "avatar",
            "skills",
            "languages",
            "business_fields",
            "company_size",
            "website",
            "company_description",
            "experience_years",
            "bio",
        ]
        read_only_fields = fields

    def get_username(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.email.split("@")[0]

    def get_avatar(self, obj):
        request = self.context.get("request") if isinstance(self.context, dict) else None
        return _clean_avatar_value(getattr(obj, "avatar", None), request=request)


class UserSerializer(serializers.ModelSerializer):
    profile_completion = serializers.SerializerMethodField(read_only=True)
    skills_json = serializers.JSONField(write_only=True, required=False)
    languages_json = serializers.JSONField(write_only=True, required=False)
    business_fields_json = serializers.JSONField(write_only=True, required=False)
    
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField(read_only=True)

    experience_years = serializers.IntegerField(required=False, min_value=0)
    
    website = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=500)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "user_type",
            "first_name",
            "last_name",
            "avatar",        
            "avatar_url",    
            "skills",
            "languages",
            "skills_json",
            "languages_json",
            "business_fields",
            "business_fields_json",
            "company_size",
            "website",
            "company_description",
            "experience_years",
            "bio",
            "phone",
            "rating",
            "created_at",
            "profile_completion",
        ]
        read_only_fields = ["id", "email", "user_type", "rating", "created_at"]

    def get_profile_completion(self, obj):
        return get_profile_completion(obj)

    def get_avatar_url(self, obj):
        request = self.context.get("request") if isinstance(self.context, dict) else None
        return _clean_avatar_value(getattr(obj, "avatar", None), request=request)

    def validate_avatar(self, value):
        if value is None:
            return value
        try:
            validate_upload(
                value,
                max_bytes=AVATAR_UPLOAD_MAX_BYTES,
                allowed_extensions=AVATAR_EXTENSIONS,
            )
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from None
        return value

    def _to_mutable_dict(self, data):
        if isinstance(data, dict) and not hasattr(data, "getlist"):
            return dict(data)

        mutable = {}
        try:
            if hasattr(data, "getlist"):
                for k in data:
                    vals = data.getlist(k)
                    if len(vals) == 0:
                        mutable[k] = None
                    elif len(vals) == 1:
                        mutable[k] = vals[0]
                    else:
                        mutable[k] = vals
            else:
                for k in data:
                    mutable[k] = data.get(k)
        except Exception:
            try:
                mutable = dict(data)
            except Exception:
                mutable = {}
        return mutable

    def _split_like_human(self, text):
        return [s.strip() for s in re.split(r"[\s,،]+", text) if s.strip()]

    def _coerce_profile_list(self, value, field_name):
        if not isinstance(value, str):
            return value

        text = value.strip()
        if not text:
            return []
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            if text.startswith(("[", "{")):
                raise serializers.ValidationError({field_name: "Expected a list of strings."}) from None
            return self._split_like_human(text)

        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, str):
            return self._split_like_human(parsed)
        raise serializers.ValidationError({field_name: "Expected a list of strings."})

    def _coerce_json_list_alias(self, value, field_name):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError({field_name: "Expected a JSON list."}) from None
        if isinstance(value, (list, tuple)):
            return list(value)
        raise serializers.ValidationError({field_name: "Expected a JSON list."})

    def _validate_profile_list(self, value, field_name):
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list of strings.")
        if any(not isinstance(item, str) for item in value):
            raise serializers.ValidationError("List entries must be strings.")
        return [item.strip() for item in value if item.strip()]

    def to_internal_value(self, data):
        mutable = self._to_mutable_dict(data)

        for field_name in ("skills", "languages", "business_fields"):
            if field_name in mutable:
                mutable[field_name] = self._coerce_profile_list(mutable[field_name], field_name)

        for alias, field_name in (
            ("skills_json", "skills"),
            ("languages_json", "languages"),
            ("business_fields_json", "business_fields"),
        ):
            alias_value = mutable.get(alias)
            if alias_value not in (None, ""):
                mutable[field_name] = self._coerce_json_list_alias(alias_value, alias)

        if "experience_years" in mutable:
            val = mutable.get("experience_years")
            if val == "":
                mutable.pop("experience_years", None)
                    
        if "company_size" in mutable:
            val = mutable.get("company_size")
            if val in ("", None):
                mutable["company_size"] = ""
            else:
                mutable["company_size"] = str(val)
                
        if "website" in mutable:
            website = mutable.get("website")
            if isinstance(website, str) and website.strip():
                if not website.startswith(('http://', 'https://')):
                    website = 'https://' + website
                mutable["website"] = website
            elif website in ("", None):
                mutable["website"] = None

        return super().to_internal_value(mutable)

    def validate_website(self, value):
        if value and value.strip():
            # Basic URL validation
            import re
            url_pattern = re.compile(
                r'^(?:http|ftp)s?://'  
                r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  
                r'localhost|'  
                r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  
                r'(?::\d+)?'
                r'(?:/?|[/?]\S+)$', re.IGNORECASE)
            
            if not url_pattern.match(value):
                raise serializers.ValidationError("لطفاً یک آدرس معتبر وارد کنید (مثال: https://example.com)")
        
        return value

    def validate_skills(self, value):
        return self._validate_profile_list(value, "skills")

    def validate_languages(self, value):
        return self._validate_profile_list(value, "languages")

    def validate_business_fields(self, value):
        return self._validate_profile_list(value, "business_fields")

    def update(self, instance, validated_data):
        validated_data.pop("skills_json", None)
        validated_data.pop("languages_json", None)
        validated_data.pop("business_fields_json", None)

        if "avatar" in validated_data:
            avatar_val = validated_data.pop("avatar")
            setattr(instance, "avatar", avatar_val)

        skills = validated_data.pop("skills", None)
        if skills is not None:
            if isinstance(skills, str):
                skills = [s.strip() for s in skills.split(",") if s.strip()]
            if not isinstance(skills, list):
                skills = list(skills) if isinstance(skills, (tuple, collections.abc.Iterable)) else []
            instance.skills = skills

        languages = validated_data.pop("languages", None)
        if languages is not None:
            if isinstance(languages, str):
                languages = [s.strip() for s in languages.split(",") if s.strip()]
            if not isinstance(languages, list):
                languages = list(languages) if isinstance(languages, (tuple, collections.abc.Iterable)) else []
            instance.languages = languages
            
        business_fields = validated_data.pop("business_fields", None)
        if business_fields is not None:
            if isinstance(business_fields, str):
                business_fields = [s.strip() for s in business_fields.split(",") if s.strip()]
            if not isinstance(business_fields, list):
                business_fields = list(business_fields) if isinstance(business_fields, (tuple, collections.abc.Iterable)) else []
            instance.business_fields = business_fields

        company_size = validated_data.pop("company_size", None)
        if company_size is not None:
            instance.company_size = company_size
            
        website = validated_data.pop("website", None)
        if website is not None:
            instance.website = website

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance