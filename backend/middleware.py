# backend/middleware.py
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.utils.deprecation import MiddlewareMixin

class AutoLoginMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Применяем только к API
        if not request.path.startswith('/api/'):
            return

        # Если сессия уже есть — ничего не делаем
        if request.session.get('_auth_user_id'):
            return

        # Создаём пользователя, если его нет
        username = 'admin'
        password = 'admin123'

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                email='admin@example.com',
                password=password
            )

        # Авторизуем
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)