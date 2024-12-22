from django.contrib import admin
from .models import Parent, ParentStudentLink

@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number')
    search_fields = ('name', 'email', 'phone_number')
    ordering = ('name',)

    def get_linked_students(self, obj):
        return ", ".join([link.student.name for link in obj.parentstudentlink_set.all()])
    get_linked_students.short_description = 'Linked Students'

@admin.register(ParentStudentLink)
class ParentStudentLinkAdmin(admin.ModelAdmin):
    list_display = ('parent', 'student')
    list_filter = ('parent', 'student')
    search_fields = ('parent__name', 'student__name')
    autocomplete_fields = ['parent', 'student']

# Register your models here.
