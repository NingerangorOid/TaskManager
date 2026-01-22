# backend/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

# === Регистрация UserProfile (оставляем как есть) ===
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'telegram_token', 'telegram_chat_id')
    search_fields = ('user__username', 'telegram_token')

# === Переопределяем UserAdmin ===
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Telegram settings'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)

# Перерегистрируем User с новым админом
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)