from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task
import requests

@receiver(post_save, sender=Task)
def send_telegram_notification(sender, instance, created, **kwargs):
    if created:
        assignee = instance.assignee
        if assignee and hasattr(assignee, 'userprofile') and assignee.userprofile.telegram_token:
            token = "ТОКЕН_ТВОЕГО_БОТА"
            chat_id = assignee.userprofile.telegram_token  # на самом деле это chat_id
            message = f"Новая задача: {instance.title}"
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            requests.post(url, data={'chat_id': chat_id, 'text': message})