from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
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
            raise serializers.ValidationError(_("ایمیل یا رمز عبور اشتباه است"))

        if not user_obj.check_password(password):
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
    skills_json = serializers.JSONField(write_only=True, required=False)
    languages_json = serializers.JSONField(write_only=True, required=False)
    business_fields_json = serializers.JSONField(write_only=True, required=False)
    
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField(read_only=True)

    experience_years = serializers.IntegerField(required=False, allow_null=True)
    
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
        ]
        read_only_fields = ["id", "email", "user_type", "rating", "created_at"]

    def get_avatar_url(self, obj):
        request = self.context.get("request") if isinstance(self.context, dict) else None
        return _clean_avatar_value(getattr(obj, "avatar", None), request=request)

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

    def to_internal_value(self, data):
        mutable = self._to_mutable_dict(data)

        skills = mutable.get("skills")
        if isinstance(skills, list):
            mutable["skills"] = skills
        elif isinstance(skills, str) and skills.strip() != "":
            try:
                parsed = json.loads(skills)
                if isinstance(parsed, list):
                    mutable["skills"] = parsed
                else:
                    mutable["skills"] = self._split_like_human(skills)
            except Exception:
                mutable["skills"] = self._split_like_human(skills)

        langs = mutable.get("languages")
        if isinstance(langs, list):
            mutable["languages"] = langs
        elif isinstance(langs, str) and langs.strip() != "":
            try:
                parsed = json.loads(langs)
                if isinstance(parsed, list):
                    mutable["languages"] = parsed
                else:
                    mutable["languages"] = self._split_like_human(langs)
            except Exception:
                mutable["languages"] = self._split_like_human(langs)
                
        business_fields = mutable.get("business_fields")
        if isinstance(business_fields, list):
            mutable["business_fields"] = business_fields
        elif isinstance(business_fields, str) and business_fields.strip() != "":
            try:
                parsed = json.loads(business_fields)
                if isinstance(parsed, list):
                    mutable["business_fields"] = parsed
                else:
                    mutable["business_fields"] = self._split_like_human(business_fields)
            except Exception:
                mutable["business_fields"] = self._split_like_human(business_fields)

        sj = mutable.get("skills_json")
        if sj is not None and sj != "":
            if isinstance(sj, (list, tuple)):
                mutable["skills"] = list(sj)
            elif isinstance(sj, str):
                try:
                    parsed = json.loads(sj)
                    if isinstance(parsed, list):
                        mutable["skills"] = parsed
                except Exception:
                    pass
                    
        lj = mutable.get("languages_json")
        if lj is not None and lj != "":
            if isinstance(lj, (list, tuple)):
                mutable["languages"] = list(lj)
            elif isinstance(lj, str):
                try:
                    parsed = json.loads(lj)
                    if isinstance(parsed, list):
                        mutable["languages"] = parsed
                except Exception:
                    pass
                    
        bfj = mutable.get("business_fields_json")
        if bfj is not None and bfj != "":
            if isinstance(bfj, (list, tuple)):
                mutable["business_fields"] = list(bfj)
            elif isinstance(bfj, str):
                try:
                    parsed = json.loads(bfj)
                    if isinstance(parsed, list):
                        mutable["business_fields"] = parsed
                except Exception:
                    pass

        if "experience_years" in mutable:
            val = mutable.get("experience_years")
            if val in ("", None):
                mutable.pop("experience_years", None)
            else:
                try:
                    mutable["experience_years"] = int(str(val))
                except Exception:
                    pass
                    
        if "company_size" in mutable:
            val = mutable.get("company_size")
            if val in ("", None):
                mutable["company_size"] = ""
            else:
                mutable["company_size"] = str(val)
                
        if "website" in mutable:
            website = mutable.get("website")
            if website and website.strip():
                if not website.startswith(('http://', 'https://')):
                    website = 'https://' + website
                mutable["website"] = website
            else:
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