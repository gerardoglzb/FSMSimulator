from django.urls import path
from . import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('', views.simulator),
	path('something/', views.something), # add name
	path('storeName/', views.storeName), # add name
	path('removeState/', views.removeState), # add name
	path('changeState/', views.changeState), # add name
	path('moveState/', views.moveState), # add name
	path('testSample/', views.testSample), # add name
]

#urlpatterns += staticfiles_urlpatterns()