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
from simulators.models import Connection
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def simulator(request):
	print("activating simulation")
	if not request.session.session_key:
		request.session.save()
	session_id = request.session.session_key
	isNewSession = False
	states = []
	initialState = ''
	connections = []
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
		for state in states:
			connections.extend(Connection.objects.filter(origin=state))
			if state.initialStateOf == stateMachine:
				initialState = state.pk
		if initialState == '':
			print("NO INITIAL STATE FOUND")
			if len(states) > 0:
				initialState = states[0].pk
				states[0].initialStateOf = stateMachine
				states[0].save()
			else:
				isNewSession = True
	return render(request, 'simulators/simulator.html', {'x': 'title', 'isNewSession': isNewSession, 'initialStateID': initialState, 'states': serializers.serialize('json', states), 'connections': serializers.serialize('json', connections)})

@csrf_exempt
def newState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	if request.POST['isInitial'] == 'true':
		if State.objects.filter(initialStateOf=stateMachine).exists():
			return HttpResponse('None')
		newState = State(stateMachineOwner=stateMachine, initialStateOf=stateMachine, currentStateOf=stateMachine)
	else:
		newState = State(stateMachineOwner=stateMachine)
	newState.left = request.POST['leftOffset']
	newState.top = request.POST['topOffset']
	newState.save()
	newState.name = newState.id
	newState.save()
	return HttpResponse(newState.id)

@csrf_exempt
def storeName(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		state = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['id'])
	except State.DoesNotExist:
		state = None
	if state:
		potentialName = request.POST['name']
		if '\r' in potentialName or '\n' in potentialName:
			return HttpResponse('')
		state.name = potentialName
		state.save()
	return HttpResponse('1')

@csrf_exempt
def removeState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		state = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['id'])
	except State.DoesNotExist:
		state = None
	if state:
		try:
			initialState = State.objects.get(initialStateOf=stateMachine)
		except State.DoesNotExist:
			return HttpResponse('0')
		if initialState == state:
			return HttpResponse('2')
		pathsCode = ''
		for connection in Connection.objects.all().filter(target=state):
			pathsCode += str(connection.origin.pk) + '-'
		state.delete()
	return HttpResponse(pathsCode+'1')

@csrf_exempt
def changeInitialState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		state = State.objects.get(initialStateOf=stateMachine)
	except State.DoesNotExist:
		state = None
	if state:
		state.initialStateOf = None
		try:
			state2 = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['id'])
		except:
			state2 = None
		if state2:
			state2.initialStateOf = stateMachine
			state.save()
			state2.save()
		else:
			return HttpResponse()
	else:
		return HttpResponse()

	return HttpResponse(request.POST['id'])

@csrf_exempt
def changeState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		state = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['id'])
	except State.DoesNotExist:
		state = None
	if state:
		if request.POST['isFalse'] == 'true':
			state.value = True
		else:
			state.value = False
		state.save()
	return HttpResponse()

@csrf_exempt
def moveState(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		state = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['id'])
	except State.DoesNotExist:
		state = None
	if state:
		state.left = request.POST['leftOffset']
		state.top = request.POST['topOffset']
		state.save()
	else:
		print("Moving failed client-side.")
	return HttpResponse()

@csrf_exempt
def storeLine(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		originState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['originBall'])
	except State.DoesNotExist:
		originState = None
	try:
		targetState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['targetBall'])
	except State.DoesNotExist:
		targetState = None
	if originState and targetState:
		try:
			possibleConnection = Connection.objects.get(origin=originState, target=targetState, transition=request.POST['path'])
		except Connection.DoesNotExist:
			possibleConnection = None
		if possibleConnection:
			return HttpResponse()
		connection = Connection(origin=originState, target=targetState, transition=request.POST['path'])
		connection.save()
	return HttpResponse(request.POST['path'])

@csrf_exempt
def changeLine(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		originState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['originBall'])
	except State.DoesNotExist:
		originState = None
	try:
		targetState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['targetBall'])
	except State.DoesNotExist:
		targetState = None
	if originState and targetState:
		connections = Connection.objects.all().filter(origin=originState, target=targetState, transition=request.POST['oldPath'])
		for connection in connections:
			connection.transition = request.POST['path']
		connection.save()
	return HttpResponse(request.POST['path'])

@csrf_exempt
def removeLine(request):
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		originState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['originBall'])
	except State.DoesNotExist:
		originState = None
	try:
		targetState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['targetBall'])
	except State.DoesNotExist:
		targetState = None
	if originState and targetState:
		connections = Connection.objects.all().filter(origin=originState, target=targetState, transition=request.POST['oldPath'])
		for connection in connections:
			connection.delete()
	return HttpResponse()

@csrf_exempt
def removeText(request):
	print("removing")
	print("PATHO:", request.POST['oldPath'])
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	try:
		originState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['originBall'])
	except State.DoesNotExist:
		originState = None
	try:
		targetState = State.objects.get(stateMachineOwner=stateMachine, pk=request.POST['targetBall'])
	except State.DoesNotExist:
		targetState = None
	if originState and targetState:
		try:
			print("PATHO:", request.POST['oldPath'])
			Connection.objects.all().get(origin=originState, target=targetState, transition=request.POST['oldPath']).delete()
		except Connection.DoesNotExist:
			return HttpResponse('0')
	return HttpResponse('1')

@csrf_exempt
def testSample(request):
	if request.POST['initialStateID'] == '':
		return HttpResponse('')
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	states = State.objects.filter(stateMachineOwner=stateMachine)
	try:
		initialState = states.get(initialStateOf=stateMachine)
	except State.DoesNotExist:
		initialState = None
	if not initialState:
		return HttpResponse('')
	connections = Connection.objects.filter(origin__stateMachineOwner=stateMachine);
	sm = SM.StateMachine()
	sm_states = {}
	for state in states:
		new_state = SM.State(state.value)
		sm_states[state.pk] = new_state
	for connection in connections:
		sm_states[connection.origin.pk].addPath(connection.transition, sm_states[connection.target.pk])
	for state in sm_states:
		sm.addState(sm_states[state])
	sm.setInitialState(sm_states[int(request.POST['initialStateID'])])
	return HttpResponse(sm.testCase(request.POST['testSample']))

@csrf_exempt
def multiTestSample(request):
	if request.POST['initialStateID'] == '':
		return HttpResponse('')
	unloggedUser = UnloggedUser.objects.get(userID=request.session['key'])
	stateMachine = StateMachine.objects.get(unloggedUser=unloggedUser)
	states = State.objects.filter(stateMachineOwner=stateMachine)
	try:
		initialState = states.get(initialStateOf=stateMachine)
	except State.DoesNotExist:
		initialState = None
	if not initialState:
		return HttpResponse('')
	connections = Connection.objects.filter(origin__stateMachineOwner=stateMachine);
	sm = SM.StateMachine()
	sm_states = {}
	for state in states:
		new_state = SM.State(state.value)
		sm_states[state.pk] = new_state
	for connection in connections:
		sm_states[connection.origin.pk].addPath(connection.transition, sm_states[connection.target.pk])
	for state in sm_states:
		sm.addState(sm_states[state])
	sm.setInitialState(sm_states[int(request.POST['initialStateID'])])
	positives = request.POST['testSamplePositive']
	if positives == '':
		positives = []
	else:
		positives = positives.split('\n')
	negatives = request.POST['testSampleNegative']
	if negatives == '':
		negatives = []
	else:
		negatives = negatives.split('\n')
	for i, p in enumerate(positives):
		if p != '' and p[-1] == '\r':
			positives[i] = p[:-1]
	for i, n in enumerate(negatives):
		if n != '' and n[-1] == '\r':
			negatives[i] = n[:-1]
	posResponse = ''
	negResponse = ''
	for pos in positives:
		if sm.testCase(pos):
			posResponse += '1'
		else:
			posResponse += '0'
	for neg in negatives:
		if sm.testCase(neg):
			negResponse += '0'
		else:
			negResponse += '1'
	return JsonResponse({'posResponse': posResponse, 'negResponse': negResponse})
