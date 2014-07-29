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
  
    "attribute float rotation;",
    "attribute float time;",
    "attribute float startTime;",
    "attribute float travelTime;",

    "attribute vec3 customColor;",
    "attribute vec3 displacement;",

    "varying vec3 vColor;",
    "varying float vRotation;",

    "void main() {",
      "float progress = time / travelTime;",

      "if (travelTime > 0.0 && progress <= 5.0) ",
      "{",
        "vRotation = rotation;",
        "vColor = customColor;",

        "vec3 newpos = (displacement * progress) + position;",
        "vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );",

        "gl_PointSize = 240.0 * ( 300.0 / length( mvPosition.xyz ) );",
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

      "gl_FragColor = vec4( color * vColor, 1.0 );",
      "gl_FragColor = gl_FragColor * texture2D( texture, rotated );",

    "}"
  ].join("\n")

  var attributes = {
    travelTime: { type: "f", value: [] },
    rotation: { type: "f", value: [] },
    displacement: { type: 'v3', value: [] },
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