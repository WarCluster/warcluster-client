module.exports = function(context) {
  this.context = context;
  this.pull = [];
  this.objectsIndexes = [];
  this.startTimes = [];
  this.cloud = null;
}

module.exports.prototype.prepare = function() {
  var geometry = new THREE.Geometry();
  var shaderMaterial = this.context.shadersManager.shipMaterials[0];

  for ( var i = 0; i < 50000; i ++ ) {
    this.pull[i] = i;
    geometry.vertices.push( new THREE.Vector3() );
  }

  geometry.vertices[0].x = -999999999999;
  geometry.vertices[0].y = -999999999999;

  geometry.vertices[1].x = 999999999999;
  geometry.vertices[1].y = 999999999999;

  this.cloud = new THREE.PointCloud( geometry, shaderMaterial );
  this.cloud.dynamic = true;
  this.cloud.matrixAutoUpdate = false;

  var vertices = this.cloud.geometry.vertices;
  var values_color = shaderMaterial.attributes.customColor.value;
  var values_startPosition = shaderMaterial.attributes.startPosition.value;
  var values_displacement = shaderMaterial.attributes.displacement.value;
  var values_time = shaderMaterial.attributes.time.value;
  var values_rotation = shaderMaterial.attributes.rotation.value;
  var values_travelTime = shaderMaterial.attributes.travelTime.value;


  for ( var v = 0; v < vertices.length; v++ ) {
    values_startPosition[v] = new THREE.Vector3();
    values_displacement[v] = new THREE.Vector3();
    values_rotation[v] = 0;

    values_time[v] = -1;
    values_color[v] = new THREE.Color( 0xffaa00 );

    this.startTimes [v] = 0;
    values_travelTime [v] = 0;
  }

  

  this.context.container.add( this.cloud );
}

module.exports.prototype.addShips = function(sizes, data, color, formation) {
  var total = sizes.length;
  var objs = this.pull.splice(0, total);
  this.objectsIndexes = this.objectsIndexes.concat(objs)

  var vertices = this.cloud.geometry.vertices;
  var values_startPosition = this.cloud.material.attributes.startPosition.value;
  var values_color = this.cloud.material.attributes.customColor.value;
  var values_displacement = this.cloud.material.attributes.displacement.value;
  var values_time = this.cloud.material.attributes.time.value;
  var values_rotation = this.cloud.material.attributes.rotation.value;
  var values_travelTime = this.cloud.material.attributes.travelTime.value;

  var sc1 = 60;
  var sc2 = 20;

  for ( var i = 0; i < objs.length; i++ ) {
    var v = objs[ i ];

    values_startPosition[v].x = data.Source.Position.X + sc1 * (Math.random() * 2 - 1);
    values_startPosition[v].y = data.Source.Position.Y + sc1 * (Math.random() * 2 - 1);
    values_startPosition[v].z = sc1 * (Math.random() * 2 - 1);

    var v1 = values_startPosition[v].clone();
    var v2 = new THREE.Vector3(data.Target.Position.X + sc2 * (Math.random() * 2 - 1), data.Target.Position.Y + sc2 * (Math.random() * 2 - 1), 0);

    var v3 = v2.clone().sub(v1);

    values_displacement[v] = v3;
    values_rotation[v] = Math.atan2(v3.y, v3.x) - Math.PI / 2;

    values_time[v] = 0;
    values_color[v] = color;

    this.startTimes[v] = data.StartTime;
    values_travelTime[v] = data.TravelTime;
  }
  
  this.cloud.material.attributes.customColor.needsUpdate = true;
  this.cloud.material.attributes.displacement.needsUpdate = true;
  this.cloud.material.attributes.time.needsUpdate = true;
  this.cloud.material.attributes.rotation.needsUpdate = true;
  this.cloud.material.attributes.travelTime.needsUpdate = true;
  this.cloud.material.attributes.startPosition.needsUpdate = true;

  //this.cloud.geometry.verticesNeedUpdate = true;

  console.log("### addShips:", total)

  return objs;
}

module.exports.prototype.removeShips = function(objs) {

  //console.log("1.removeShips:", this.objectsIndexes.length, objs.length, objs)
  while (objs.length) {
    var item = objs.shift()
    var index = this.objectsIndexes.indexOf(item)
    this.objectsIndexes.splice(index, 1)
    this.pull.push(item)

    this.cloud.material.attributes.time.value[item] = -1;

    //this.cloud.material.attributes.travelTime.value [ item ] = 0
  }

  //console.log("2.removeShips:", this.objectsIndexes.length, objs.length)

  /*if (item)
    this.cloud.material.attributes.travelTime.needsUpdate = true;*/

  return objs;
}

module.exports.prototype.update = function() {
  var ln = this.objectsIndexes.length;
  //var forRemove = [];

  for( var i = 0; i < ln; i++ ) {
    this.cloud.material.attributes.time.value[ this.objectsIndexes[ i ] ] = this.context.currentTime - this.startTimes[ this.objectsIndexes[ i ] ];
    /*if (this.context.currentTime - this.startTimes[ this.objectsIndexes[ i ] ] >= this.cloud.material.attributes.travelTime.value[ this.objectsIndexes[ i ] ]) {
      forRemove.push( this.objectsIndexes[ i ] )
    }*/
  }
  
  /*if (forRemove.length) 
    this.removeShips(forRemove);*/

  if (ln)
    this.cloud.material.attributes.time.needsUpdate = true;
}

