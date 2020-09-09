from django.http import HttpResponse
from django.shortcuts import render

def about(request):
	# return HttpResponse("about")
	return render(request, "about.html")

def home(request):
	return render(request, "home.html")
	# return HttpResponse("home")