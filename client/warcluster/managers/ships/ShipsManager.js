var ObjectPullGeometry = require("../../threejs/geometry/ObjectPullGeometry");

module.exports = function(context, cacheSize) {
  this.context = context;
  this.pull = [];
  this.objectsIndexes = [];
  this.startTimes = [];
  this.cloud = null;
  this.cacheSize = cacheSize;
  this.shipsForRemove = [];
  this.index = 0;
}

module.exports.prototype.prepare = function() {
  var self = this;
  var geometry = new ObjectPullGeometry();
  var shaderMaterial = this.buildShipMaterial();

  for ( var i = 0; i < this.cacheSize; i ++ ) {
    this.pull[i] = i;
    geometry.vertices.push( new THREE.Vector3() );
  }

  this.cloud = new THREE.PointCloud( geometry, shaderMaterial );
  this.cloud.dynamic = true;
  this.cloud.matrixAutoUpdate = false;

  var vertices = this.cloud.geometry.vertices;
  var values_color = shaderMaterial.attributes.customColor.value;
  var values_displacement = shaderMaterial.attributes.displacement.value;
  var values_formation = this.cloud.material.attributes.formation.value;
  var values_time = shaderMaterial.attributes.time.value;
  var values_rotation = shaderMaterial.attributes.rotation.value;
  var values_travelTime = shaderMaterial.attributes.travelTime.value;
  
  for ( var v = 0; v < vertices.length; v++ ) {
    values_displacement[v] = new THREE.Vector3();
    values_formation[v] = new THREE.Vector3();
    values_rotation[v] = 0;

    values_time[v] = -1;
    values_color[v] = new THREE.Color( 0xffaa00 );

    this.startTimes[v] = 0;
    values_travelTime [v] = 0;
  }

  this.context.container.add( this.cloud );
}

module.exports.prototype.addShips = function(sizes, mission, color, formation) {
  var data = mission.data;
  var total = sizes.length;
  var objs = this.pull.splice(0, total);
  this.objectsIndexes = this.objectsIndexes.concat(objs)

  var vertices = this.cloud.geometry.vertices;
  var values_color = this.cloud.material.attributes.customColor.value;
  var values_displacement = this.cloud.material.attributes.displacement.value;
  var values_formation = this.cloud.material.attributes.formation.value;
  var values_time = this.cloud.material.attributes.time.value;
  var values_rotation = this.cloud.material.attributes.rotation.value;
  var values_travelTime = this.cloud.material.attributes.travelTime.value;
  var values_texPosition = this.cloud.material.attributes.texPosition.value;

  var tsVec = this.cloud.material.uniforms.tileSize.value;

  var sc1 = 5;
  var sc2 = 15;

  for ( var i = 0; i < objs.length; i++ ) {
    var v = objs[ i ];
    
    vertices[v].x = data.Source.Position.X + (Math.random() * 2 - 1) * sc1;
    vertices[v].y = data.Source.Position.Y + (Math.random() * 2 - 1) * sc1;
    vertices[v].z = 0;

    var v1 = vertices[v].clone();
    var v2 = new THREE.Vector3(data.Target.Position.X + (Math.random() * 2 - 1) * sc2, data.Target.Position.Y + (Math.random() * 2 - 1) * sc2, (Math.random() * 2 - 1) * sc2);

    var v3 = v2.clone().sub(v1);

    values_displacement[v] = v3;
    values_formation[v] = formation[i].clone().rotateXY(mission.angle);
    values_formation[v].multiplyScalar(((sizes[i] + 1) / 5) * 0.7 + 0.3);

    values_rotation[v] = Math.atan2(v3.y, v3.x) - Math.PI / 2;

    values_time[v] = 0;
    values_color[v] = color;

    this.startTimes[v] = data.StartTime;
    values_travelTime[v] = data.TravelTime;
    values_texPosition[ v ] = new THREE.Vector2(sizes[i], 0).multiply(tsVec)
  }
  
  this.cloud.material.attributes.customColor.needsUpdate = true;
  this.cloud.material.attributes.displacement.needsUpdate = true;
  this.cloud.material.attributes.formation.needsUpdate = true;
  this.cloud.material.attributes.time.needsUpdate = true;
  this.cloud.material.attributes.rotation.needsUpdate = true;
  this.cloud.material.attributes.travelTime.needsUpdate = true;
  this.cloud.material.attributes.texPosition.needsUpdate = true;

  this.cloud.geometry.verticesNeedUpdate = true;

  //console.log("### addShips:", total)

  return objs;
}

module.exports.prototype.removeShips = function(ships) {
  //console.log("removeShip:", item)
  while (ships.length > 0) {
    item = ships.shift();

    var index = this.objectsIndexes.indexOf(item)
    this.objectsIndexes.splice(index, 1)
    this.pull.push(item)

    this.cloud.material.attributes.time.value[item] = -1;
  }
}

module.exports.prototype.update = function() {
  var ln = this.objectsIndexes.length;

  for( var i = 0; i < ln; i++ )
    this.cloud.material.attributes.time.value[ this.objectsIndexes[ i ] ] = this.context.currentTime - this.startTimes[ this.objectsIndexes[ i ] ];
  
  if (ln)
    this.cloud.material.attributes.time.needsUpdate = true;

  //console.log("-update-", Date.now() - t, lsh - this.shipsForRemove.length)
}

module.exports.prototype.checkForRemove = function() {
  if (!this.context.missions.length)
    return ;
  
  if (!this.$missions)
    this.$missions = [].concat(this.context.missions)

  var mission;

  while (this.$missions.length && Date.now() - this.context.renderTime < 15) {
    mission = this.$missions.shift();
    if (mission.isForRemove()) {
      this.context.missionsFactory.destroy(mission);
      this.removeShips(mission.ships);
    }
  }

  //console.log("-checkForRemove-", Date.now() - this.context.renderTime, missions.length, this.index)

  if (!this.$missions.length) {
    //console.log("------------------------------------------------------------------------------------------------------------------------")
    this.$missions = null;
  }
}

module.exports.prototype.buildShipMaterial = function() {
  var vertexshader = [
    "uniform float size;",

    "attribute float rotation;",
    "attribute float time;",
    "attribute float startTime;",
    "attribute float travelTime;",
    "attribute vec2 texPosition;",

    "attribute vec3 customColor;",
    "attribute vec3 displacement;",
    "attribute vec3 formation;",

    "varying vec3 vColor;",
    "varying float vRotation;",
    "varying vec2 vTexPosition;",

    "const float showHideTime = 3300.0;",

    "void main() {",
      "if (time >= 0.0 && time < travelTime) ",
      "{",
        "vRotation = rotation;",
        "vColor = customColor;",
        "vTexPosition = texPosition;",

        "float sc = (clamp(time, 0.0, showHideTime) / showHideTime) * (1.0 - clamp(time - (travelTime - showHideTime), 0.0, showHideTime) / showHideTime);",

        "float progress = time / travelTime;",
        "vec3 newpos = (displacement * progress) + position + formation * (sc + 0.2);",
        "vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );",

        "gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) ) * (sc + 0.05);",
        "gl_Position = projectionMatrix * mvPosition;",
      "}",
    "}"
  ].join("\n")


  var fragmentshader = [

    "uniform vec2 tileSize;",
    "uniform sampler2D texture;",

    "varying vec3 vColor;",
    "varying float vRotation;",
    "varying vec2 vTexPosition;",

    "void main() {",
      "float mid = 0.5;",
      "vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) - sin(vRotation) * (gl_PointCoord.y - mid) + mid,",
                          "cos(vRotation) * (gl_PointCoord.y - mid) + sin(vRotation) * (gl_PointCoord.x - mid) + mid);",

      "gl_FragColor = vec4( vColor , 1.0 );",
      "gl_FragColor = gl_FragColor * texture2D( texture, rotated * tileSize + vTexPosition );",

    "}"
  ].join("\n")

  var attributes = {
    texPosition: { type: "v2", value: [] },
    displacement: { type: 'v3', value: [] },
    formation: { type: 'v3', value: [] },
    rotation: { type: "f", value: [] },
    travelTime: { type: "f", value: [] },
    time: { type: 'f', value: [] },
    customColor: { type: 'c', value: [] }
  };

  var uniforms = {
    
    size:      { type: "f", value: 1000 * this.context.globalScale },
    tileSize:  { type: "v2", value: new THREE.Vector2( 0.2, 1 ) },
    texture:   { type: "t", value: this.context.resourcesLoader.get("/images/ships/ships.png") }

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