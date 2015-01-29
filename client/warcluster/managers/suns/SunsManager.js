var ObjectPullGeometry = require("../../threejs/geometry/ObjectPullGeometry");

module.exports = function(context, cacheSize) {
  this.context = context;
  this.pull = [];
  this.objectsIndexes = [];
  this.cloud = null;
  this.cacheSize = cacheSize;
}

module.exports.prototype.prepare = function() {
  var self = this;
  var geometry = new ObjectPullGeometry();
  var shaderMaterial = this.buildGlowMaterial();

  for ( var i = 0; i < this.cacheSize; i ++ ) {
    this.pull[i] = i;
    geometry.vertices.push( new THREE.Vector3(0, 0, 150000) );
  }

  this.cloud = new THREE.PointCloud( geometry, shaderMaterial );
  this.cloud.dynamic = true;
  this.cloud.matrixAutoUpdate = false;

  var vertices = this.cloud.geometry.vertices;
  var values_color = shaderMaterial.attributes.color.value;

  for ( var v = 0; v < vertices.length; v++ ) {
    values_color[v] = new THREE.Color( 0xffaa00 );
  }

  this.context.container.add( this.cloud );
  this.t = Date.now();
}

module.exports.prototype.addSunGlow = function(x, y, z, color) {
  var objs = this.pull.splice(0, 1);
  if (objs.length && objs[0])
   this.objectsIndexes.push(objs[0]);
  else
    return null;

  var vertices = this.cloud.geometry.vertices;
  var values_color = this.cloud.material.attributes.color.value;

  var v = objs[ 0 ];
  
  vertices[v].x = x;
  vertices[v].y = y;
  vertices[v].z = z;

  values_color[v] = color;

  this.cloud.material.attributes.color.needsUpdate = true;

  this.cloud.geometry.verticesNeedUpdate = true;
  return v;
}

module.exports.prototype.removeSunGlow = function(item) {
  var index = this.objectsIndexes.indexOf(item);
  this.objectsIndexes.splice(index, 1);
  this.pull.push(item);

  var vertices = this.cloud.geometry.vertices;
  if (item !== null) {
    vertices[item].z = 150000;
  }

  this.cloud.geometry.verticesNeedUpdate = true;
}

module.exports.prototype.update = function() {
  var ln = this.objectsIndexes.length;
  if (ln) {
    this.cloud.material.uniforms.time.value += (Date.now() - this.t) * 0.00002;
    this.cloud.material.uniforms.time.needsUpdate = true;
  }

  this.t = Date.now();
}

module.exports.prototype.updateSize = function() {
  var ln = this.objectsIndexes.length;
  if (ln) { 
    this.cloud.material.uniforms.aspect.value = this.context.aspect;
    this.cloud.material.uniforms.aspect.value.needsUpdate = true;
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

    "uniform sampler2D texture;",
    "uniform float time;",

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
    time: { type: 'f', value: 0 },
    aspect: { type: 'f', value: this.context.aspect },
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