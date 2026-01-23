# backend/serializers.py
from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import Task, Comment, Attachment
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_superuser', 'is_staff']
        read_only_fields = ['is_superuser']


class TaskSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)

    # Поле для записи assignee (принимает ID пользователя)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        allow_null=True,
        required=False,
        source='assignee'  # Сохраняет в поле assignee модели
    )
    attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']

    def validate_assignee_id(self, value):
        if value and not value.is_active:
            raise serializers.ValidationError("Нельзя назначить задачу неактивному пользователю.")
        return value

    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        validated_data['author'] = self.context['request'].user
        task = super().create(validated_data)

        # Сохраняем вложения
        for file in attachments:
            Attachment.objects.create(task=task, file=file)

        return task


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'created_at']
        read_only_fields = ['author', 'created_at']


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class TelegramTokenSerializer(serializers.Serializer):
    telegram_token = serializers.CharField(read_only=True)

    def create(self, validated_data):
        user = self.context['request'].user
        user.telegram_token = get_random_string(32)
        user.save()
        return {'telegram_token': user.telegram_token}