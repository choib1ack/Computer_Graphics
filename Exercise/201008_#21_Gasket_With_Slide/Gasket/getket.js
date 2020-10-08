var gl;
var points = [];
var numTimesToSubDivide = 0;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Initialize the corners of our gasket with three points.
    var vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];


    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 50000, gl.STATIC_DRAW);

    // Associate vertex data buffer with shader variables
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider").onchange = function() {
        numTimesToSubDivide = event.srcElement.value;

        divideTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubDivide);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
        render();
    }
};

function triangle(a, b, c){
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count){
    if(count == 0){
        triangle(a, b, c);
    }
    else{
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        divideTriangle(a, ac, ab, count);
        divideTriangle(c, bc, ac, count);
        divideTriangle(b, ab, bc, count);
    }
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    points = [];
    requestAnimFrame(init);
}