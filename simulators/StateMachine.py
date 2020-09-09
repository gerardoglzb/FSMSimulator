class StateMachine:
	def __init__(self):
		self.states = []
		self.initialState = None
		self.currentState = None

	def setInitialState(self, state):
		self.initialState = state

	def addState(self, state):
		self.states.append(state)

	def getState(self):
		return self.currentState.value

	def addInput(self, input):
		self.currentState = self.currentState.goThrough(input)

	def testCase(self, input):
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
		return self.paths[path]

	def setPaths(self, paths):
		self.paths.update(paths);

	def setValue(self, value):
		self.value = value
