from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import Task, Comment, Attachment, TelegramSubscription
from .serializers import (UserSerializer, TaskSerializer, CommentSerializer,
                          AttachmentSerializer, TelegramTokenSerializer)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(author=user) | Task.objects.filter(assignee=user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        return Comment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(author=self.request.user, task=task)

@method_decorator(csrf_exempt, name='dispatch')
class TelegramLinkView(View):
    def post(self, request):
        data = json.loads(request.body)
        token = data.get('token')  # это chat_id, который пользователь получил от бота
        user = request.user

        if not user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)

        # Сохраняем или обновляем
        sub, created = TelegramSubscription.objects.update_or_create(
            user=user,
            defaults={'telegram_chat_id': token}
        )

        return JsonResponse({
            'status': 'ok',
            'message': 'Telegram успешно привязан' if created else 'Telegram обновлён'
        })


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Attachment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        # Заглушка: реальная загрузка файлов — позже
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(
            task=task,
            uploaded_by=self.request.user,
            file_name='placeholder.txt',
            file_path='/uploads/placeholder.txt'
        )


class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate_telegram_token(self, request):
        serializer = TelegramTokenSerializer(context={'request': request})
        result = serializer.create({})
        return Response(result, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def demo_login(request):
    username = 'admin'
    password = 'admin123'

    # Создаём пользователя, если его нет
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, 'admin@example.com', password)

    # Получаем JWT-токен
    user = User.objects.get(username=username)
    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })


@method_decorator(csrf_exempt, name='dispatch')
class TelegramLinkView(View):
    def post(self, request):
        data = json.loads(request.body)
        chat_id = data.get('chat_id')  # ← имя поля должно совпадать с тем, что шлёт фронт
        user = request.user

        if not user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)

        if not chat_id:
            return JsonResponse({'error': 'chat_id is required'}, status=400)

        # Сохраняем или обновляем
        sub, created = TelegramSubscription.objects.update_or_create(
            user=user,
            defaults={'telegram_chat_id': chat_id}
        )

        return JsonResponse({
            'status': 'ok',
            'message': 'Telegram успешно привязан' if created else 'Telegram обновлён'
        })