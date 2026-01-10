from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import User, Task, Comment, Attachment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_superuser']
        read_only_fields = ['is_superuser']


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    author = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source='assignee'
    )

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']

    def validate_assignee_id(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Нельзя назначить задачу неактивному пользователю.")
        return value


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['author']


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file_name', 'created_at']


class TelegramTokenSerializer(serializers.Serializer):
    telegram_token = serializers.CharField(read_only=True)

    def create(self, validated_data):
        user = self.context['request'].user
        user.telegram_token = get_random_string(32)
        user.save()
        return {'telegram_token': user.telegram_token}