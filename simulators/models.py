from django.db import models


class UnloggedUser(models.Model):
	userID = models.TextField(default='', primary_key=True)


class StateMachine(models.Model):
	unloggedUser  = models.OneToOneField(UnloggedUser, on_delete=models.CASCADE, related_name='unlogged_user_of', default='')
	# userID = models.TextField(default='')


class State(models.Model):
	value = models.BooleanField(default=False)
	name = models.TextField(default='')
	left = models.FloatField(default=0.0)
	top = models.FloatField(default=0.0)
	stateMachineOwner = models.ForeignKey(StateMachine, on_delete=models.CASCADE, null=True)
	initialStateOf = models.OneToOneField(StateMachine, on_delete=models.CASCADE, related_name='initial_state_of', null=True, blank=True)
	currentStateOf = models.OneToOneField(StateMachine, on_delete=models.CASCADE, related_name='current_state_of', null=True, blank=True)



	# def __init__(self):
	# 	self.states = []
	# 	self.initialState = None
	# 	self.currentState = None

	# def setInitialState(self, state):
	# 	self.initialState = state

	# def addState(self, state):
	# 	self.states.append(state)

	# def getState(self):
	# 	return self.currentState.value

	# def addInput(self, input):
	# 	self.currentState = self.currentState.goThrough(input)

	# def testCase(self, input):
	# 	for ch in input:
	# 		self.addInput(ch)
	# 	return self.getState()

	# def start(self):
	# 	self.currentState = self.initialState


# class State(models.Model):
# 	value = models.BooleanField(default=False)
# 	# def __init__(self, value):
# 	# 	self.value = value
# 	# 	self.paths = {}

# 	# def goThrough(self, path):
# 	# 	return self.paths[path]

# 	# def setPaths(self, paths):
# 	# 	self.paths.update(paths);

# 	# def setValue(self, value):
# 	# 	self.value = value


# class Path(models.Model):
# 	pass