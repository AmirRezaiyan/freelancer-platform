from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not password:
            raise ValueError("Superuser must have a password.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ("client", "Client"),
        ("freelancer", "Freelancer"),
    )
    
    COMPANY_SIZES = (
        ("small", "Small (1-10)"),
        ("medium", "Medium (11-50)"),
        ("large", "Large (50+)"),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=120, blank=True)
    last_name = models.CharField(max_length=120, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default="client")

    skills = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    
    business_fields = models.JSONField(default=list, blank=True)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES, blank=True)
    website = models.URLField(max_length=500, blank=True, null=True)  # Changed to allow null
    company_description = models.TextField(blank=True)

    experience_years = models.PositiveIntegerField(default=0)
    phone = models.CharField(max_length=32, blank=True)

    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(default=timezone.now)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email