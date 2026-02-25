from rest_framework import routers
from django.urls import path, include
from .views import TicketViewSet, TypeOfServiceViewSet, CSATSurveyViewSet, EscalationLogViewSet, list_employees
from users.views import RegisterViewSet, CustomTokenObtainPairView, UserViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = routers.DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'auth', RegisterViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'type-of-service', TypeOfServiceViewSet, basename='typeofservice')
router.register(r'csat', CSATSurveyViewSet, basename='csat')
router.register(r'escalation-logs', EscalationLogViewSet, basename='escalationlog')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('employees/', list_employees, name='list_employees'),
]
