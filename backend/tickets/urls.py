from rest_framework import routers
from django.urls import path, include
from .views import TicketViewSet, TypeOfServiceViewSet, EscalationLogViewSet, list_employees
from users.views import AuthViewSet, CustomTokenObtainPairView, UserViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = routers.DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'type-of-service', TypeOfServiceViewSet, basename='typeofservice')
router.register(r'escalation-logs', EscalationLogViewSet, basename='escalationlog')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('employees/', list_employees, name='list_employees'),
]
