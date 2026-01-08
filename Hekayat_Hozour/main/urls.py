from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name = 'index'),
    path('send_code/', views.send_code, name = 'send_code'),
    path('verify_code/', views.verify_code, name = 'verify_code'),
    path('get_days_status/', views.get_days_status, name = 'get_days_status'),
    path('give_day/', views.give_day, name = 'give_day'),
    path('save_reserv/', views.save_reserv, name = 'save_reserv'),
    path('check_phone/', views.check_phone, name = 'check_phone'),
    path('skip/', views.skip, name = 'skip'),
]