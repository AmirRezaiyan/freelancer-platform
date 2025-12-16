from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
	list_display = ("email", "first_name", "last_name", "user_type", "is_active", "is_staff", "created_at")
	list_filter = ("user_type", "is_active", "is_staff")
	search_fields = ("email", "first_name", "last_name")
	ordering = ("-created_at",)
	readonly_fields = ("created_at",)
	fieldsets = (
		(None, {"fields": ("email", "password")}),
		("Personal info", {"fields": ("first_name", "last_name", "user_type", "skills", "languages", "bio", "avatar", "rating", "experience_years", "phone")}),
		("Company info", {"fields": ("business_fields", "company_size", "website", "company_description")}),
		("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
		("Important dates", {"fields": ("last_login", "created_at")}),
	)
	add_fieldsets = (
		(None, {
			"classes": ("wide",),
			"fields": ("email", "password1", "password2", "user_type", "is_active", "is_staff", "is_superuser"),
		}),
	)
