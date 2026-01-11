from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = []

    def get_queryset(self):
        return Task.objects.filter(author=self.request.user) | Task.objects.filter(assignee=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)