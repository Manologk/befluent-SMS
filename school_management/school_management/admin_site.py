from django.contrib.admin import AdminSite
from django.contrib.auth.models import User, Group


class SchoolManagementAdminSite(AdminSite):
    site_header = 'School Management System'
    site_title = 'School Management Admin'
    index_title = 'School Management Administration'
    site_url = None  # Removes the "View Site" link

    def get_app_list(self, request, app_label=None):
        """
        Customize the ordering of apps in the admin interface
        """
        # If specific app_label is requested, return original behavior
        if app_label:
            return super().get_app_list(request, app_label)

        # Get the original app list
        app_list = super().get_app_list(request)
        app_dict = {app['app_label']: app for app in app_list}

        # Define the preferred order of apps
        ordered_apps = [
            'students',
            'parents',
            'notifications',
            'auth',
        ]

        # Create ordered list with preferred apps first
        ordered_app_list = []

        # Add apps in preferred order
        for app_label in ordered_apps:
            if app_label in app_dict:
                ordered_app_list.append(app_dict[app_label])
                del app_dict[app_label]

        # Add any remaining apps
        for app in app_dict.values():
            ordered_app_list.append(app)

        return ordered_app_list


admin_site = SchoolManagementAdminSite(name='school_management_admin')
