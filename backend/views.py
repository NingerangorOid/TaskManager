from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Task, Comment, Attachment
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