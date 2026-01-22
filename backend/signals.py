# backend/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.apps import apps
from .models import UserProfile, Task, Comment, Attachment
from .notifications import send_telegram_notification

# Явный импорт модели
Comment = apps.get_model('backend', 'Comment')
print(f"Модель Comment загружена: {Comment}")

# === Создание профиля при создании пользователя ===
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

# === Уведомления о задачах ===
@receiver(post_save, sender=Task)
def notify_on_task_change(sender, instance, created, **kwargs):
    if not instance.assignee:
        return

    try:
        profile = UserProfile.objects.get(user=instance.assignee)
        if not profile.telegram_chat_id:
            print("У пользователя нет telegram_chat_id")
            return

        if created:
            msg = (
                f"Новая задача!\n"
                f"Название: {instance.title}\n"
                f"Описание: {instance.description or '-'}\n"
                f"Статус: {instance.get_status_display()}"
            )
        else:
            try:
                old_instance = Task.objects.get(pk=instance.pk)
                if old_instance.status != instance.status:
                    msg = (
                        f"Статус задачи изменён!\n"
                        f"Задача: {instance.title}\n"
                        f"Старый статус: {old_instance.get_status_display()}\n"
                        f"Новый статус: {instance.get_status_display()}"
                    )
                else:
                    msg = (
                        f"Задача обновлена!\n"
                        f"Название: {instance.title}\n"
                        f"Статус: {instance.get_status_display()}"
                    )
            except Task.DoesNotExist:
                msg = (
                    f"️Задача обновлена!\n"
                    f"Название: {instance.title}\n"
                    f"Статус: {instance.get_status_display()}"
                )

        print(f" Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
        send_telegram_notification(profile.telegram_chat_id, msg)
    except UserProfile.DoesNotExist:
        pass
    except Exception as e:
        print("Ошибка уведомления о задаче:", str(e))

# === Уведомления о комментариях ===
@receiver(post_save, sender=Comment)
def notify_on_comment(sender, instance, created, **kwargs):
    if not created:
        return

    task = instance.task
    assignee = task.assignee
    if not assignee:
        return

    try:
        profile = UserProfile.objects.get(user=assignee)
        if not profile.telegram_chat_id:
            print("❌ У пользователя нет telegram_chat_id")
            return

        msg = (
            f" Новый комментарий!\n"
            f"Задача: {task.title}\n"
            f"Автор: {instance.author.username}\n"
            f"Текст: {instance.text[:100]}{'...' if len(instance.text) > 100 else ''}"
        )

        print(f"Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
        send_telegram_notification(profile.telegram_chat_id, msg)
    except UserProfile.DoesNotExist:
        pass
    except Exception as e:
        print("Ошибка уведомления о комментарии:", str(e))

# === Уведомления о вложениях ===
@receiver(post_save, sender=Attachment)
def notify_on_attachment(sender, instance, created, **kwargs):
    if not created:
        return

    task = instance.task
    assignee = task.assignee
    if not assignee:
        return

    try:
        profile = UserProfile.objects.get(user=assignee)
        if not profile.telegram_chat_id:
            print("У пользователя нет telegram_chat_id")
            return

        file_name = instance.file.name.split('/')[-1]

        msg = (
            f"📎 Новое вложение!\n"
            f"Задача: {task.title}\n"
            f"Файл: {file_name}\n"
            f"Добавил: {instance.task.author.username}"
        )

        print(f"Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
        send_telegram_notification(profile.telegram_chat_id, msg)
    except UserProfile.DoesNotExist:
        pass
    except Exception as e:
        print("Ошибка уведомления о вложении:", str(e))

# === Уведомления об удалении задачи ===
@receiver(post_delete, sender=Task)
def notify_on_task_delete(sender, instance, **kwargs):
    if not instance.assignee:
        return

    try:
        profile = UserProfile.objects.get(user=instance.assignee)
        if not profile.telegram_chat_id:
            print("У пользователя нет telegram_chat_id")
            return

        msg = (
            f"🗑Задача удалена!\n"
            f"Название: {instance.title}\n"
            f"Статус: {instance.get_status_display()}"
        )

        print(f"✅ Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
        send_telegram_notification(profile.telegram_chat_id, msg)
    except UserProfile.DoesNotExist:
        pass
    except Exception as e:
        print("Ошибка уведомления об удалении задачи:", str(e))