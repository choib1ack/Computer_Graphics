var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),
    ];

var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0),  // white
    ];

var near = -1;
var far = 1;
var radius = 1;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var modelViewMatrix, projectionViewMatrix;
var modelViewMatrixLoc, projectionViewMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// quad uses first index to set color for face
function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}

// Each face determines two triangles
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}



window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    // color array attribute buffer
    // creating a buffer to store colors of vertices
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    //associating vertex data buffer with shader variables in program
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // vertex array attribute buffer
    //creating a buffer to store coordinates of vertices
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    //associating vertex data buffer with shader variables in program
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionViewMatrixLoc = gl.getUniformLocation(program, "projectionViewMatrix");
    
    // Sliders for viewing parameters
    document.getElementById("depthSlider").onchange = function (event) {
        far = event.target.value / 2;
        near = -event.target.value / 2;
    }
    document.getElementById("radiusSlider").onchange = function (event) {
        radius = event.target.value;
    }
    document.getElementById("thetaSlider").onchange = function (event) {
        theta = event.target.value * Math.PI / 180;
    }
    document.getElementById("phiSlider").onchange = function (event) {
        phi = event.target.value * Math.PI / 180;
    }
    document.getElementById("heightSlider").onchange = function (event) {
        ytop = event.target.value / 2;
        bottom = -event.target.value / 2;
    }
    document.getElementById("widthSlider").onchange = function (event) {
        right = event.target.value / 2;
        left = -event.target.value / 2;
    }

    render();
}


var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Eye point
    eye = vec3(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta),
            radius * Math.cos(theta) * Math.cos(phi)); 
    // Forming the required modelview matrix
    modelViewMatrix = lookAt(eye, at , up);
    projectionViewMatrix = ortho(left, right, bottom, ytop, near, far);

    // Uniform matrix for model view and projection view
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
    gl.uniformMatrix4fv(projectionViewMatrixLoc, false, flatten(projectionViewMatrix))

    // Draw cube
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame(render);
}

