# backend/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Task, Comment, Attachment
from .notifications import send_telegram_notification

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

        # Подсчитываем вложения
        attachment_count = instance.attachments.count()
        attachment_text = f"📎 {attachment_count} вложение(я)" if attachment_count > 0 else ""

        if created:
            msg = (
                f"✅ Новая задача!\n"
                f"Название: {instance.title}\n"
                f"Описание: {instance.description or '-'}\n"
                f"Статус: {instance.get_status_display()}\n"
                f"{attachment_text}"
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
                    f"Задача обновлена!\n"
                    f"Название: {instance.title}\n"
                    f"Статус: {instance.get_status_display()}"
                )

        print(f"Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
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
            f"💬 Новый комментарий!\n"
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
            f"🗑 Задача удалена!\n"
            f"Название: {instance.title}\n"
            f"Статус: {instance.get_status_display()}"
        )

        print(f"✅ Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
        send_telegram_notification(profile.telegram_chat_id, msg)
    except UserProfile.DoesNotExist:
        pass
    except Exception as e:
        print("Ошибка уведомления об удалении задачи:", str(e))


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
            print("❌ У пользователя нет telegram_chat_id")
            return

        msg = (
            f"📎 К задаче «{task.title}» прикреплён файл.\n"
            f"Файл: {instance.file.name.split('/')[-1]}"
        )

        print(f"Отправляем уведомление на chat_id: {profile.telegram_chat_id}")
        send_telegram_notification(profile.telegram_chat_id, msg)
    except UserProfile.DoesNotExist:
        pass
    except Exception as e:
        print("Ошибка уведомления о вложении:", str(e))