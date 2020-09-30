class StateMachine:
	def __init__(self):
		self.states = []
		self.initialState = None
		self.currentState = None

	def setInitialState(self, state):
		self.initialState = state

	def addState(self, state):
		self.states.append(state)

	def getStates(self):
		return self.states

	def getState(self):
		if self.currentState is None:
			return False
		return self.currentState.value

	def addInput(self, input):
		  if self.currentState is not None:
		  	self.currentState = self.currentState.goThrough(input)

	def testCase(self, input):
		self.currentState = self.initialState
		for ch in input:
			self.addInput(ch)
		return self.getState()

	def start(self):
		self.currentState = self.initialState

class State:
	def __init__(self, value):
		self.value = value
		self.paths = {}

	def goThrough(self, path):
		if path not in self.paths:
			return None
		return self.paths[path]

	def setPaths(self, paths):
		self.paths.update(paths);

	def addPath(self, transition, target):
		self.paths[transition] = target;

	def setValue(self, value):
		self.value = value