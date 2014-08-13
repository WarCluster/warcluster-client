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
    geometry.vertices.push( new THREE.Vector3() );
  }

  this.cloud = new THREE.PointCloud( geometry, shaderMaterial );
  this.cloud.dynamic = true;
  this.cloud.matrixAutoUpdate = false;

  var vertices = this.cloud.geometry.vertices;
  var values_color = shaderMaterial.attributes.color.value;
  var values_time = shaderMaterial.attributes.time.value;
  
  for ( var v = 0; v < vertices.length; v++ ) {
    values_time[v] = -1;
    values_color[v] = new THREE.Color( 0xffaa00 );
  }

  this.context.container.add( this.cloud );
}

module.exports.prototype.addSunGlow = function(x, y, z, color) {
  var objs = this.pull.splice(0, 1);

  if (objs.length)
   this.objectsIndexes.push(objs[0]);
  else
    return null;

  var vertices = this.cloud.geometry.vertices;
  var values_color = this.cloud.material.attributes.color.value;
  var values_time = this.cloud.material.attributes.time.value;

  var v = objs[ 0 ];
  
  vertices[v].x = x;
  vertices[v].y = y;
  vertices[v].z = z;

  values_time[v] = -1;
  values_color[v] = color;
  
  this.cloud.material.attributes.color.needsUpdate = true;
  this.cloud.material.attributes.time.needsUpdate = true;

  this.cloud.geometry.verticesNeedUpdate = true;

  return objs[0];
}

module.exports.prototype.removeSunGlow = function(item) {
  var index = this.objectsIndexes.indexOf(item)
  this.objectsIndexes.splice(index, 1)
  this.pull.push(item)

  this.cloud.material.attributes.time.value[item] = -1;
}

module.exports.prototype.update = function() {
  var ln = this.objectsIndexes.length;

  for( var i = 0; i < ln; i++ )
    this.cloud.material.attributes.time.value[ this.objectsIndexes[ i ] ] = this.context.currentTime;
  
  if (ln)
    this.cloud.material.attributes.time.needsUpdate = true;
}

module.exports.prototype.buildGlowMaterial = function() {
  var vertexshader = [

    "attribute float time;",
    "attribute vec3 color;",

    "varying vec3 vColor;",
    "varying float vTime;",

    "void main() {",
      "if (time != -1.0) {",
        "vColor = color;",
        "vTime = time;",

        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

        "gl_PointSize = 9000.0 * ( 300.0 / length( mvPosition.xyz ) );",
        "gl_Position = projectionMatrix * mvPosition;",
      "}",
    "}"
  ].join("\n")


  var fragmentshader = [

    "uniform sampler2D texture;",

    "varying vec3 vColor;",
    "varying float vTime;",

    "void main() {",
      "float mid = 0.5;",
      "float angle = vTime * 0.002;",
      "vec2 rotated = vec2(cos(angle) * (gl_PointCoord.x - mid) - sin(angle) * (gl_PointCoord.y - mid) + mid,",
                          "cos(angle) * (gl_PointCoord.y - mid) + sin(angle) * (gl_PointCoord.x - mid) + mid);",

      "gl_FragColor = vec4( vColor , 1.0 );",
      "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",

    "}"
  ].join("\n")

  var attributes = {
    time: { type: 'f', value: [] },
    color: { type: 'c', value: [] }
  };

  var uniforms = {
    texture:   { type: "t", value: this.context.resourcesLoader.get('/images/lensflare0.png') }
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