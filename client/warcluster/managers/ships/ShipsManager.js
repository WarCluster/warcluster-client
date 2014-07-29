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

  this.cloud = new THREE.PointCloud( geometry, shaderMaterial );
  this.cloud.dynamic = true;
  this.cloud.matrixAutoUpdate = false;

  var vertices = this.cloud.geometry.vertices;
  var values_color = shaderMaterial.attributes.customColor.value;
  var values_displacement = shaderMaterial.attributes.displacement.value;
  var values_time = shaderMaterial.attributes.time.value;
  var values_rotation = shaderMaterial.attributes.rotation.value;
  var values_travelTime = shaderMaterial.attributes.travelTime.value;

  for ( var v = 0; v < vertices.length; v++ ) {
    values_displacement[ v ] = new THREE.Vector3();
    values_rotation[ v ] = 0;

    values_time[ v ] = 0;
    values_color[ v ] = new THREE.Color( 0xffaa00 );

    this.startTimes [ v ] = 0;
    values_travelTime [ v ] = 0;
  }

  this.context.container.add( this.cloud );
}

module.exports.prototype.addShips = function(data) {
  var total = data.ShipCount;
  var t = Date.now();
  var objs = this.pull.splice(0, total);
  this.objectsIndexes = this.objectsIndexes.concat(objs)

  var vertices = this.cloud.geometry.vertices;
  var values_color = this.cloud.material.attributes.customColor.value;
  var values_displacement = this.cloud.material.attributes.displacement.value;
  var values_time = this.cloud.material.attributes.time.value;
  var values_rotation = this.cloud.material.attributes.rotation.value;
  var values_travelTime = this.cloud.material.attributes.travelTime.value;

  var sc1 = 20;
  var sc2 = 20;

  for ( var i = 0; i < objs.length; i++ ) {
    var v = objs[ i ];

    vertices[v].x = data.Source.Position.X + sc1 * (Math.random() * 2 - 1);
    vertices[v].y = data.Source.Position.Y + sc1 * (Math.random() * 2 - 1);
    vertices[v].z = sc1 * (Math.random() * 2 - 1);

    var v1 = vertices[v].clone(); //new THREE.Vector3(sc1 * (Math.random() * 2 - 1), sc1 * (Math.random() * 2 - 1), sc1 * (Math.random() * 2 - 1));
    var v2 = new THREE.Vector3(data.Target.Position.X + sc2 * (Math.random() * 2 - 1), data.Target.Position.Y + sc2 * (Math.random() * 2 - 1), 0);

    var v3 = v2.clone().sub(v1);

    values_displacement[ v ] = v3; //new THREE.Vector3(sc1 * (Math.random() * 2 - 1), sc1 * (Math.random() * 2 - 1), sc1 * (Math.random() * 2 - 1));
    values_rotation[ v ] = Math.atan2(v3.y, v3.x) - Math.PI / 2;

    values_time[ v ] = 0;
    values_color[ v ] = new THREE.Color( 0xffaa00 );

    this.startTimes [ v ] = Date.now();
    values_travelTime [ v ] = 15000 + 5000 * Math.random();

    if ( vertices[ v ].x < 0 )
      values_color[ v ].setHSL( 0.5 + 0.1 * ( v / vertices.length ), 0.7, 0.5 );
    else
      values_color[ v ].setHSL( 0.0 + 0.1 * ( v / vertices.length ), 0.9, 0.5 );
  }

  this.cloud.material.attributes.customColor.needsUpdate = true;
  this.cloud.material.attributes.displacement.needsUpdate = true;
  this.cloud.material.attributes.time.needsUpdate = true;
  this.cloud.material.attributes.rotation.needsUpdate = true;
  this.cloud.material.attributes.travelTime.needsUpdate = true;

  this.cloud.geometry.verticesNeedUpdate = true;

  console.log("### addShips:", values_displacement[ v ], v1, v2, total, Date.now() - t)
}

module.exports.prototype.update = function() {
  var t = Date.now();
  var ln = this.objectsIndexes.length;

  for( var i = 0; i < ln; i++ )
    this.cloud.material.attributes.time.value[ this.objectsIndexes[ i ] ] = t - this.startTimes[ this.objectsIndexes[ i ] ];
  
  if (ln)
    this.cloud.material.attributes.time.needsUpdate = true;
}
