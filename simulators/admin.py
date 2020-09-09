from django.contrib import admin
from .models import StateMachine
from .models import State
from .models import UnloggedUser

admin.site.register(StateMachine)
admin.site.register(State)
admin.site.register(UnloggedUser)
