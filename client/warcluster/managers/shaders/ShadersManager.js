module.exports = function(context) {
  this.context = context;
  this.shipMaterials = [];
}

module.exports.prototype.prepare = function() {
  for (var i = 1;i < 5; i++)
    this.shipMaterials.push(this.prepareShipMaterial(i))
}

module.exports.prototype.prepareShipMaterial = function(type) {
  var vertexshader = [
    "uniform vec3 color;",

    "attribute float rotation;",
    "attribute float time;",
    "attribute float startTime;",
    "attribute float travelTime;",

    "attribute vec3 customColor;",
    "attribute vec3 startPosition;",
    "attribute vec3 displacement;",

    "varying vec3 vColor;",
    "varying float vRotation;",

    "void main() {",
      "if (time >= 0.0 && time < travelTime) ",
      "{",
        "vRotation = rotation;",
        "vColor = customColor;",
        "float progress = time / travelTime;",

        "vec3 newpos = (displacement * progress) + startPosition;",
        "vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );",

        "gl_PointSize = 300.0 * ( 300.0 / length( mvPosition.xyz ) );",
        "gl_Position = projectionMatrix * mvPosition;",
      "}",
    "}"
  ].join("\n")


  var fragmentshader = [

    "uniform vec3 color;",
    "uniform sampler2D texture;",

    "varying vec3 vColor;",
    "varying float vRotation;",

    "void main() {",
      "float mid = 0.5;",
      "vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) - sin(vRotation) * (gl_PointCoord.y - mid) + mid,",
                          "cos(vRotation) * (gl_PointCoord.y - mid) + sin(vRotation) * (gl_PointCoord.x - mid) + mid);",

      "gl_FragColor = vec4( color , 1 );",
      "gl_FragColor = gl_FragColor * texture2D( texture, rotated );",

    "}"
  ].join("\n")

  var attributes = {
    startPosition: { type: "v3", value: [] },
    displacement: { type: 'v3', value: [] },
    rotation: { type: "f", value: [] },
    travelTime: { type: "f", value: [] },
    time: { type: 'f', value: [] },
    customColor: { type: 'c', value: [] }
  };

  var uniforms = {
    
    color:     { type: "c", value: new THREE.Color( 0xffffff ) }, 
    texture:   { type: "t", value: this.context.resourcesLoader.get("/images/ships/ship"+type+".png") }

  };

  var shaderMaterial = new THREE.ShaderMaterial( {

    uniforms:       uniforms,
    attributes:     attributes,
    vertexShader:   vertexshader,
    fragmentShader: fragmentshader,

      depthTest:      false,
    transparent:    true

  });

  return shaderMaterial;
}