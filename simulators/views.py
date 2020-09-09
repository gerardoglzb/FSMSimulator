from . import StateMachine as SM
from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.http import JsonResponse
from django.core import serializers
import json
from django.core.serializers.json import DjangoJSONEncoder
from simulators.models import UnloggedUser
from simulators.models import StateMachine
from simulators.models import State

# Create your views here.
def simulator(request):
	print("activating simulation")
	if not request.session.session_key:
		request.session.save()
	session_id = request.session.session_key
	isNewSession = False
	states = []
	objectIsNull = False
	try:
		unloggedUser = UnloggedUser.objects.get(userID=session_id)
	except:
		objectIsNull = True
	if 'isInDB' not in request.session or objectIsNull:
		print("new USER")
		isNewSession = True
		request.session['isInDB'] = True
		request.session['key'] = session_id
		unloggedUser = UnloggedUser(userID=session_id)
		unloggedUser.save()
		stateMachine = StateMachine(unloggedUser=unloggedUser)
		stateMachine.save()
		print("new user saved")
	else:
		unloggedUser = UnloggedUser.objects.get(userID=session_id)
		stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
		states = State.objects.filter(stateMachineOwner=stateMachine)
		# initialState = State(value=False, stateMachineOwner=stateMachine, initialStateOf=stateMachine, currentStateOf=stateMachine)
		# initialState.save()
	return render(request, 'simulators/simulator.html', {'x': 'title', 'isNewSession': isNewSession, 'states': serializers.serialize('json', states)})

def something(request): #change name, refers to the state creation
	print("doing something......")
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	if request.POST['isInitial'] == 'true':
		if State.objects.filter(initialStateOf=stateMachine).exists():
			return HttpResponse('None')
		newState = State(stateMachineOwner=stateMachine, initialStateOf=stateMachine, currentStateOf=stateMachine)
	else:
		newState = State(stateMachineOwner=stateMachine)
	# newState.name
	newState.left = request.POST['leftOffset']
	newState.top = request.POST['topOffset']
	newState.save()
	newState.name = newState.id
	newState.save()
	print("NEW STATE SAVED!!!")
	# response_data = {}
	# response_data['id'] = newState.id
	# response_data['leftOffset'] = request.POST['leftOffset']
	# response_data['topOffset'] = request.POST['topOffset']
	return HttpResponse(newState.id)

def storeName(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	state = State.objects.get(pk=request.POST['id'])
	state.name = request.POST['name']
	state.save()
	return HttpResponse()

def removeState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	state = State.objects.get(pk=request.POST['id'])
	state.delete()
	return HttpResponse()


def changeState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	state = State.objects.get(pk=request.POST['id'])
	print("found the right one")
	if request.POST['isFalse'] == 'true':
		print("changed to true")
		state.value = True
	else:
		state.value = False
	state.save()
	return HttpResponse()

def moveState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	state = State.objects.get(pk=request.POST['id'])
	state.left = request.POST['leftOffset']
	state.top = request.POST['topOffset']
	state.save()
	return HttpResponse()

def testSample(request):
	print('SAMPLIIIIIING')
	print(request.POST['testSample'])
	return HttpResponse('hey')


'''

start = State(True)
s0 = State(False)
s1 = State(True)
s2 = State(True)
start.setPaths({"0": s0, "1": s2})
s0.setPaths({"0": start, "1": s1})
s1.setPaths({"0": s2, "1": s0})
s2.setPaths({"0": s1, "1": start})
stateMachine = StateMachine()
stateMachine.addState(start)
stateMachine.addState(s0)
stateMachine.addState(s1)
stateMachine.addState(s2)
stateMachine.setInitialState(start)
stateMachine.start()
print(stateMachine.testCase(""))
'''