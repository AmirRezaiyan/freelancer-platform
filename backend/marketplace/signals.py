from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Proposal, ActivityLog, Project

@receiver(post_save, sender=Proposal)
def log_proposal(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.freelancer,
            action=f"Sent proposal to project: {instance.project.title}"
        )

@receiver(post_save, sender=Project)
def log_project(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.client,
            action=f"Created new project: {instance.title}"
        )
