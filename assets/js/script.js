let diameter = 100;
let innerDiameter = 85;
let originBall;
let currentSlope;
let currentOriginX;
let currentOriginY;
let from = {};
let to = [];
let isNewConnection;
let targetBall;
let currentLine;
let selectedText;
let currentBall;
let previousX;
let previousY;
let mayDragHorizontally = true;
let arrowInState = false;
let isShifting = false; // use shifKey property instead
let isDrawingArrow = false;
let mayDragVertically = true;
let canvas = document.getElementById('canvas');
let pressingCanvas = document.getElementById('pressingCanvas');
let multiResponseBox = document.getElementById('multi-response-box');
let leftBar = document.getElementById('left-bar');
let leftBarBox4 = document.getElementById('left-bar-box-4');
let localConnections = {}
let responseBox = document.getElementById('response-box');
let modal = document.getElementById('connection-modal');
let connectionInput = document.getElementById('connection-input');
let cancelBtn = document.getElementById('cancel-model');
let acceptBtn = document.getElementById('accept-model');
let holdingID = null;
let initialStateColor = '#04395E';
let normalStateColor = '#FB8F67';
let circleDiameter = 50;
let currentCircle;
let isNewLine;