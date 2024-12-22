from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

class EmailTokenObtainView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                user = User.objects.get(email=email)
                response.data.update({
                    'user_id': user.pk,
                    'email': user.email,
                    'role': user.role
                })
            return response
                
        except Exception as e:
            return Response({'error': str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
