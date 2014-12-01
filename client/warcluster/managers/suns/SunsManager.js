var ObjectPullGeometry = require("../../threejs/geometry/ObjectPullGeometry");

module.exports = function(context) {
  this.context = context;
  this.cloud = null;
}

module.exports.prototype.prepare = function() {
  var self = this;
  var geometry = new ObjectPullGeometry();
  geometry.vertices = []

  var shaderMaterial = this.buildGlowMaterial();
  var colors = shaderMaterial.attributes.color.value;
  for (var v = 0; v < vertices.length; v++ ) {
    color[v] = new THREE.Color( 0xffaa00 );
  }

  this.cloud = new THREE.PointCloud( geometry, shaderMaterial );
  this.cloud.dynamic = true;
  this.cloud.matrixAutoUpdate = false;

  this.context.container.add( this.cloud );
  this.t = Date.now();
}

module.exports.prototype.addSunGlow = function(x, y, z, color) {
  var vertices = this.cloud.geometry.vertices;
  var colors = this.cloud.material.attributes.color.value;

  vertices.push_back(new THREE.Vector3(x, y, z));
  this.cloud.geometry.verticesNeedUpdate = true;

  colors.push_back(color);
  this.cloud.material.attributes.color.needsUpdate = true;

  return vertices.length-1;
}

module.exports.prototype.removeSunGlow = function(idx) {
  var vertices = this.cloud.geometry.vertices;
  vertices.splice(idx, 1);
  this.cloud.geometry.verticesNeedUpdate = true;

  var colors = this.cloud.material.attributes.color.value;
  colors.splice(idx, 1);
  this.cloud.material.attributes.color.needsUpdate = true;
}

module.exports.prototype.update = function() {
  var now = Date.now();
  this.cloud.material.uniform.time.value += (now - this.t) * 0.00002;
  this.cloud.material.unifrom.time.needsUpdate = true;

  this.cloud.material.uniform.aspect.value = this.context.aspect;
  this.cloud.material.uniform.aspect.needsUpdate = true;

  this.t = Date.now();
}

module.exports.prototype.updateSize = function() {
  }
}

module.exports.prototype.buildGlowMaterial = function() {
  var vertexshader = [

    "uniform float time;",
    "uniform float aspect;",

    "attribute vec3 color;",

    "varying vec3 vColor;",

    "void main() {",
      "vColor = color;",

      "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

      "gl_PointSize = 12000.0 * ( 300.0 / length( mvPosition.xyz ) ) * aspect;",
      "gl_Position = projectionMatrix * mvPosition;",
    "}"
  ].join("\n")


  var fragmentshader = [

    "uniform float time;",
    "uniform sampler2D texture;",

    "varying vec3 vColor;",

    "void main() {",
      "float mid = 0.5;",
      "float angle = time;",

      "vec2 rotated1 = vec2(cos(angle) * (gl_PointCoord.x - mid) - sin(angle) * (gl_PointCoord.y - mid) + mid,",
                           "cos(angle) * (gl_PointCoord.y - mid) + sin(angle) * (gl_PointCoord.x - mid) + mid);",

      "vec2 rotated2 = vec2(cos(-angle) * (gl_PointCoord.x - mid) - sin(-angle) * (gl_PointCoord.y - mid) + mid,",
                           "cos(-angle) * (gl_PointCoord.y - mid) + sin(-angle) * (gl_PointCoord.x - mid) + mid);",

      "gl_FragColor = vec4( vColor , 1.0 );",
      "gl_FragColor *= texture2D( texture, rotated1 ) * texture2D( texture, rotated2 );",

    "}"
  ].join("\n")

  var attributes = {
    color: { type: 'c', value: [] }
  };

  var uniforms = {
    time: { type: 'f', value: [0.0] },
    aspect: { type: 'f', value: [1.0] },
    texture:   { type: "t", value: this.context.resourcesLoader.get('/images/suns/sun_glow.png') }
  };

  var shaderMaterial = new THREE.ShaderMaterial( {
    uniforms:       uniforms,
    attributes:     attributes,
    vertexShader:   vertexshader,
    fragmentShader: fragmentshader,

    blending:       THREE.AdditiveBlending,
    depthTest:      false,
    transparent:    true
  });

  return shaderMaterial;
}
