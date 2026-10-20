from django.db import models
from django.conf import settings
from .storage import PrivateMessageStorage

class Project(models.Model):
    CATEGORY_CHOICES = [
        ("web", "Web Development"),
        ("mobile", "Mobile Development"),
        ("design", "Design"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),  
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    budget_min = models.PositiveIntegerField(blank=True, null=True)
    budget_max = models.PositiveIntegerField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    skills = models.JSONField(default=list, blank=True)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects"
    )
    hired_freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="hired_projects"
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=["status", "-created_at"], name="prj_status_created_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(budget_min__isnull=True) | models.Q(budget_min__gte=1),
                name="prj_budget_min_positive",
            ),
            models.CheckConstraint(
                check=models.Q(budget_max__isnull=True) | models.Q(budget_max__gte=1),
                name="prj_budget_max_positive",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(budget_min__isnull=True)
                    | models.Q(budget_max__isnull=True)
                    | models.Q(budget_min__lte=models.F("budget_max"))
                ),
                name="prj_budget_bounds_order",
            ),
        ]


class Proposal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="proposals")
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proposals"
    )
    message = models.TextField()
    bid_amount = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proposal by {self.freelancer.email} for {self.project.title}"
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["project", "freelancer"], name="unique_proposal_per_freelancer_per_project"),
            models.UniqueConstraint(
                fields=["project"],
                condition=models.Q(status="accepted"),
                name="proposal_one_accepted_per_project",
            ),
            models.CheckConstraint(check=models.Q(bid_amount__gte=1), name="proposal_bid_min_1"),
        ]


class ProjectMessage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=True)
    attachment = models.FileField(
        upload_to='messages/',
        null=True,
        blank=True,
        storage=PrivateMessageStorage(),
    )
    sticker = models.CharField(max_length=150, null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message by {self.sender} on {self.project.title}"

    class Meta:
        indexes = [
            models.Index(fields=["project", "-created_at"], name="msg_project_created_idx"),
        ]


class Portfolio(models.Model):
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolios"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    media = models.FileField(upload_to='portfolio/', null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Portfolio by {self.freelancer.email}: {self.title}"

    class Meta:
        ordering = ['-created_at']
        
        
class Wallet(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wallet"
    )
    balance = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} Wallet"


class ActivityLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activities"
    )
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.action}"
    
    
class Rating(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="ratings")
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="given_ratings")
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_ratings")
    rating = models.PositiveSmallIntegerField()  # 1-5
    review = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=["to_user", "-created_at"], name="rating_to_created_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["project", "from_user", "to_user"],
                name="rating_unique_direction",
            ),
            models.CheckConstraint(
                check=models.Q(rating__gte=1, rating__lte=5),
                name="rating_value_1_5",
            ),
        ]

    def __str__(self):
        return f"Rating {self.rating} from {self.from_user} to {self.to_user} ({self.project})"