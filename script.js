$(function() {
  setupCanvas(function () {
    setupDrawingHandlers();
    setupToolsHandlers()

    redraw();
  });
});

function setupCanvas(callback) {
  console.log('---------------------------');
  img = new Image;
  img.src = 'https://i.ibb.co/pfcNPtH/2023-02-13-11-58-31-a-woman-dancing-oil-painting.jpg';
  img.onload = function () {
    console.log('img.width: ' + img.width);
    console.log('img.height: ' + img.height);
    console.log('wrapper width: ' + $('#wrapper').width());
    
    var canvasDiv = document.getElementById('canvasDiv');
    var canvasWidth = $('#wrapper').width();
    var canvasHeight = img.height * (canvasWidth / img.width);
    if (canvasHeight > $('body').height() - 100) {
      console.log('asd');
      canvasHeight = $('body').height() - 100;
      canvasWidth = img.width * (canvasHeight / img.height);
    }
    console.log('canvasWidth: ' + canvasWidth);
    console.log('canvasHeight: ' + canvasHeight);
    var canvas = document.createElement('canvas');
    var paint = false;
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
      canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");
    callback();
  };
}

function setupDrawingHandlers() {
  $('#canvas').on('mousedown touchstart', function(e) {
    var rect = this.getBoundingClientRect();
    var mouseX = e.pageX - rect.left;
    var mouseY = e.pageY - rect.top;

    paint = true;
    addClick(mouseX, mouseY, false);
    redraw();
  });
  $('#canvas').on('mousemove', function(e) {
    if (paint) {
      var rect = this.getBoundingClientRect();
      var mouseX = e.pageX - rect.left;
      var mouseY = e.pageY - rect.top;

      addClick(mouseX, mouseY, true);
      redraw();
    }
  });
  $('#canvas').on('touchmove', function(e) {
    if (e.touches) {
      if (e.touches.length == 1) { // Only deal with one finger
        var touch = e.touches[0]; // Get the information for finger #1
        var rect = this.getBoundingClientRect();
        var touchX = touch.pageX - rect.left;
        var touchY = touch.pageY - rect.top;

        addClick(touchX, touchY, true);
        redraw();
      }
    }
    e.preventDefault(); // avoid scrolling
  });
  $('#canvas').on('mouseup touchend mouseleave', function(e) {
    paint = false;
  });
}

function setupToolsHandlers() {
  $('.color-red').click(function () {
    currentColor = colorRed;
    $('.color').removeClass('selected');
    $(this).addClass('selected');
  });
  $('.color-blue').click(function () {
    currentColor = colorBlue;
    $('.color').removeClass('selected');
    $(this).addClass('selected');
  });
  $('.color-green').click(function () {
    currentColor = colorGreen;
    $('.color').removeClass('selected');
    $(this).addClass('selected');
  });
  $('.color-yellow').click(function () {
    currentColor = colorYellow;
    $('.color').removeClass('selected');
    $(this).addClass('selected');
  });
  $('.clear-drawing').click(clearDrawing);
}


var strokes = [];
var paint = false;;

var colorRed = "#DC3333";
var colorBlue = "#3393DC";
var colorGreen = "#2DB93B";
var colorYellow = "#E3EF3E";

var currentColor = colorRed;

var img;

function addClick(x, y, dragging) {
  var stroke;
  if (dragging) {
    stroke = strokes[strokes.length - 1];
    stroke.coordinates.push({x: x, y: y});
  } else {
    stroke = {
      coordinates: [{x: x, y: y}],
      color: currentColor
    }
    strokes.push(stroke);

    console.log(strokes);
  }
}

function redraw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the base image
  
  context.lineJoin = "round";
  context.lineWidth = 5;
  
  var currentTime = (new Date()).getTime();
  for (var i = strokes.length - 1; i >= 0; i--) {
    var s = strokes[i];
    if (s.fadeOutTime) {
      var timeDiff = currentTime - s.fadeOutTime;
      if (timeDiff > 5000) {
        strokes.splice(i, 1);
        continue;
      }
      context.globalAlpha = 1 - timeDiff / 5000;
    } else {
      s.fadeOutTime = currentTime;
    }
    context.beginPath();
    context.moveTo(s.coordinates[0].x, s.coordinates[0].y);
    for (var j = 1; j < s.coordinates.length; j++) {
      context.lineTo(s.coordinates[j].x, s.coordinates[j].y);
    }
    context.strokeStyle = s.color;
    context.stroke();
    context.globalAlpha = 1;
  }
  
  requestAnimationFrame(redraw); // Call redraw again before the next repaint
}

redraw(); // Start the drawing loop

function clearDrawing() {
  strokes = [];
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
}
