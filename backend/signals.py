from django.contrib.auth import get_user_model
from .models import UserProfile, Task
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task
from bot.bot import notify_user_about_task

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(post_save, sender=Task)
def notify_assignee_on_new_task(sender, instance, created, **kwargs):
    if created and instance.assignee:
        message = f"Новая задача: {instance.title}\nСтатус: {instance.get_status_display()}"
        notify_user_about_task(instance.assignee.id, message)


@receiver(post_save, sender=Task)
def notify_assignee_on_new_task(sender, instance, created, **kwargs):
    if created and instance.assignee:
        message = f"Новая задача: {instance.title}\nСтатус: {instance.get_status_display()}"
        notify_user_about_task(instance.assignee.id, message)