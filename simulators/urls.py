from django.urls import path
from . import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('', views.simulator),
	path('newState/', views.newState), # add name
	path('storeName/', views.storeName), # add name
	path('removeState/', views.removeState), # add name
	path('changeState/', views.changeState), # add name
	path('moveState/', views.moveState), # add name
	path('testSample/', views.testSample), # add name
	path('multiTestSample/', views.multiTestSample), # add name
	path('storeLine/', views.storeLine), # add name
	path('changeLine/', views.changeLine), # add name
	path('removeLine/', views.removeLine), # add name
	path('removeText/', views.removeText), # add name
	path('changeInitialState/', views.changeInitialState), # add name
]

#urlpatterns += staticfiles_urlpatterns()