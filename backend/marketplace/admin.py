from django.contrib import admin
from .models import Project, Proposal, ProjectMessage, Portfolio, Wallet, ActivityLog, Rating

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ("title", "client", "category", "status", "created_at")
	list_filter = ("category", "status")
	search_fields = ("title", "client__email")
	ordering = ("-created_at",)

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
	list_display = ("project", "freelancer", "status", "bid_amount", "created_at")
	list_filter = ("status",)
	search_fields = ("project__title", "freelancer__email")
	ordering = ("-created_at",)

@admin.register(ProjectMessage)
class ProjectMessageAdmin(admin.ModelAdmin):
	list_display = ("project", "sender", "created_at", "read")
	list_filter = ("read",)
	search_fields = ("project__title", "sender__email")
	ordering = ("-created_at",)

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
	list_display = ("freelancer", "title", "created_at")
	search_fields = ("freelancer__email", "title")
	ordering = ("-created_at",)

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
	list_display = ("user", "balance")
	search_fields = ("user__email",)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
	list_display = ("user", "action", "created_at")
	search_fields = ("user__email", "action")
	ordering = ("-created_at",)

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
	list_display = ("project", "from_user", "to_user", "rating", "created_at")
	search_fields = ("project__title", "from_user__email", "to_user__email")
	ordering = ("-created_at",)
