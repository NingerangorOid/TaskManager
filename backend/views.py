# backend/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model, authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import Task, Comment, Attachment, TelegramSubscription
from .serializers import (UserSerializer, TaskSerializer, CommentSerializer,
                          AttachmentSerializer, TelegramTokenSerializer)

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            # Админ видит всё
            return Task.objects.all().extra(
                select={'is_mine': "author_id = %s OR assignee_id = %s"},
                select_params=[user.id, user.id]
            ).order_by('-is_mine', '-created_at')

        elif user.is_staff:
            # Staff видит всё, кроме задач админов
            admin_users = User.objects.filter(is_superuser=True).values_list('id', flat=True)
            return Task.objects.exclude(author__in=admin_users).extra(
                select={'is_mine': "author_id = %s OR assignee_id = %s"},
                select_params=[user.id, user.id]
            ).order_by('-is_mine', '-created_at')

        else:
            # Обычный пользователь — только свои
            return Task.objects.filter(author=user) | Task.objects.filter(assignee=user)

    def perform_update(self, serializer):
        task = serializer.instance
        user = self.request.user
        new_status = self.request.data.get('status')

        # Только админы и staff могут ставить "urgent" и "canceled"
        if new_status in ['urgent', 'canceled']:
            if not (user.is_staff or user.is_superuser):
                raise PermissionDenied("Только администраторы могут устанавливать статус «Срочная» или «Отменена».")

        # Проверка прав на редактирование
        if not (
                user == task.author or
                user == task.assignee or
                user.is_staff or
                user.is_superuser
        ):
            raise PermissionDenied("У вас нет прав на редактирование этой задачи.")

        serializer.save()

    def perform_create(self, serializer):
        # Получаем assignee_id из validated_data
        assignee = serializer.validated_data.get('assignee')

        # Запрет: обычный пользователь не может назначать задачу админу
        if assignee and assignee.is_staff and not self.request.user.is_staff:
            raise serializers.ValidationError({
                'assignee': 'Вы не можете назначать задачи администраторам.'
            })

        serializer.save(author=self.request.user, assignee=assignee)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Comment.objects.filter(task_id=self.kwargs['task_pk']).order_by('-created_at')

    def perform_create(self, serializer):
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(author=self.request.user, task=task)


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Attachment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(task=task)


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

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, 'admin@example.com', password)

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
        chat_id = data.get('chat_id')
        user = request.user

        if not user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)

        if not chat_id:
            return JsonResponse({'error': 'chat_id is required'}, status=400)

        sub, created = TelegramSubscription.objects.update_or_create(
            user=user,
            defaults={'telegram_chat_id': chat_id}
        )

        return JsonResponse({
            'status': 'ok',
            'message': 'Telegram успешно привязан' if created else 'Telegram обновлён'
        })


@method_decorator(ensure_csrf_cookie, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'ok',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_staff': user.is_staff,
                }
            })
        return JsonResponse({'error': 'Неверный логин или пароль'}, status=400)


class LogoutView(View):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return JsonResponse({'status': 'ok'})


@ensure_csrf_cookie
@csrf_exempt
def whoami(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'is_staff': request.user.is_staff,
            }
        })
    return JsonResponse({'error': 'Not authenticated'}, status=401)