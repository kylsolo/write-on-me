$(function() {
  // Dynamically adjust canvas size on window resize
  $(window).resize(function() {
    resizeCanvas();
  });

  setupCanvas(function () {
    setupDrawingHandlers();
    setupToolsHandlers();
    redraw();
  });
});

function setupCanvas(callback) {
  console.log('---------------------------');
  img = new Image;
  img.src = 'https://i.ibb.co/pfcNPtH/2023-02-13-11-58-31-a-woman-dancing-oil-painting.jpg';
  img.onload = function () {
    adjustCanvasSize(); // Adjust canvas size based on image and viewport
    callback();
  };
}

function adjustCanvasSize() {
  console.log('Adjusting canvas size');
  var canvasDiv = document.getElementById('canvasDiv');
  var canvasWidth = $('#wrapper').width();
  var canvasHeight = img.height * (canvasWidth / img.width);
  if (canvasHeight > $('body').height() - 100) {
    canvasHeight = $('body').height() - 100;
    canvasWidth = img.width * (canvasHeight / img.height);
  }
  var canvas = document.getElementById('canvas') || document.createElement('canvas');
  canvas.setAttribute('width', canvasWidth);
  canvas.setAttribute('height', canvasHeight);
  canvas.setAttribute('id', 'canvas');
  if (!canvas.getContext) {
    canvasDiv.appendChild(canvas);
  }
  context = canvas.getContext("2d");
}

// Resizing canvas on window resize
function resizeCanvas() {
  adjustCanvasSize();
  redraw(); // Redraw everything on resize to fit new dimensions
}

// Updated touch and mouse handlers for drawing
function setupDrawingHandlers() {
  $('#canvas').on('mousedown touchstart', function(e) {
    // Handling touch events differently
    var mouseX, mouseY;
    if (e.originalEvent.touches) {
      e.preventDefault(); // Prevent scrolling when drawing
      var touch = e.originalEvent.touches[0];
      mouseX = touch.pageX - this.offsetLeft;
      mouseY = touch.pageY - this.offsetTop;
    } else {
      mouseX = e.pageX - this.offsetLeft;
      mouseY = e.pageY - this.offsetTop;
    }
    paint = true;
    addClick(mouseX, mouseY, false);
    redraw();
  });

  // Combined mouse and touch move events
  $(document).on('mousemove touchmove', '#canvas', function(e) {
    if (paint) {
      var mouseX, mouseY;
      if (e.originalEvent.touches) {
        var touch = e.originalEvent.touches[0];
        mouseX = touch.pageX - this.offsetLeft;
        mouseY = touch.pageY - this.offsetTop;
      } else {
        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;
      }
      addClick(mouseX, mouseY, true);
      redraw();
    }
  });

  // Unified end drawing handler
  $(document).on('mouseup touchend mouseleave', '#canvas', function(e) {
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
  if (!paint) return; // Only redraw if needed (e.g., when drawing)
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
  
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

// Adjusted to optimize and conditionally control the drawing loop for efficiency
function redraw() {
  if (!paint) {
    // Ensures redraw is called only when needed, reducing unnecessary CPU usage
    return;
  }
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height); // Draw the base image

  // Your existing logic for handling strokes and drawing them on the canvas

  requestAnimationFrame(redraw); // Continues the loop, optimized for visual updates
}

// Now, instead of starting the drawing loop immediately with redraw();
// It's recommended to start it based on a specific event, like a touch or mouse down,
// to ensure it runs only when necessary, optimizing resource usage.

function clearDrawing() {
  strokes = []; // Clears the drawing strokes
  context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height); // Redraws the background image
}
