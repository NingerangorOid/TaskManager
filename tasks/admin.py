from django.contrib import admin
from .models import Task, Comment, Attachment

admin.site.register(Task)
admin.site.register(Comment)
admin.site.register(Attachment)