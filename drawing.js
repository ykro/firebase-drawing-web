var rows = 16;
var columns = 32;
var pixelSize = 30;

var username, color, width, height, squareSize;
var firebaseURL = 'https://led-drawing.firebaseio.com';
var dataRef = new Firebase(firebaseURL);    

var colors = ["#ffffff","#000000","#ff0000","#00ff00","#0000ff","#8888ff","#ff88dd","#ff8888","#ff0055","#ff8800","#00ff88","#ccff00","#0088ff","#440088","#ffff88","#88ffff"];

function setup() {
  color = colors[Math.round(Math.random()*colors.length)];
  width = columns * pixelSize;
  height = rows * pixelSize;
  squareSize = width/colors.length;

  createCanvas(width+1, height+squareSize+1);  
  
  var x = 0;
  var y = height-squareSize-1;
  for (var i = 0; i < colors.length; i++) {
    fill(colors[i]);
    rect(x, y, squareSize, squareSize);	  	
    x += squareSize;
  }
}

function sendData(x, y){
  if (x < columns && y < rows) {
    dataRef.child(x + ":" + y).set(color === "#ffffff" ? null : color);         
  }
}

function mouseClicked() {

  if (mouseY > (height-pixelSize-squareSize)) {
  	if (mouseY > (height - squareSize)){
	    color = colors[Math.ceil(mouseX/squareSize)-1];
  	}    
  } else {  	    
    var x = Math.round(mouseX/pixelSize);
    var y = Math.round(mouseY/pixelSize);             
    sendData(x,y);
  }
}

function mouseDragged() {  
  if (mouseY < (height-pixelSize-squareSize)) {
    var x = Math.round(mouseX/pixelSize);
    var y = Math.round(mouseY/pixelSize);	
    sendData(x,y);
  }
}

function myDraw(x,y, color){
  fill(color);
  stroke(color);
  rect(x, y, pixelSize, pixelSize);	  
}

var drawPixel = function(snapshot) {  
  var coords = snapshot.key().split(":");
  myDraw(coords[0]*pixelSize,coords[1]*pixelSize,snapshot.val());  
};

var clearPixel = function(snapshot) {
  var coords = snapshot.key().split(":");
  myDraw(coords[0]*pixelSize,coords[1]*pixelSize,"#fff");
};

function logout() {
  dataRef.unauth();
  window.location.href = "index.html";
}

window.onload = function (){
  var authData = dataRef.getAuth();
  if (!authData) {
    window.location.href = "index.html";
  } else {
    if (authData.provider === "twitter") {
      username = "@" + authData.twitter.username;
    } else if (authData.provider === "password") {
      username = authData.password.email;
    }

    document.getElementById("username").innerHTML = "Hi " + username;

    var path = username.replace(".","_");
    dataRef = dataRef.child(path);
    dataRef.on('child_added', drawPixel);
    dataRef.on('child_changed', drawPixel);
    dataRef.on('child_removed', clearPixel);

  }
}