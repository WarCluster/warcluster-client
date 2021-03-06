module.exports = function(context){
  THREE.Object3D.call(this);
  var _self = this;

  this.context = context;

  var _self = this;
  var mouse = { x: 0, y: 0 };

  var bgd1 = this.context.resourcesLoader.get("/images/backgrounds/background1.jpg");
  var bgd2 = this.context.resourcesLoader.get("/images/backgrounds/background3.jpg");

  var i;

  // stars
  var radius = 1500000;
  var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

  for ( i = 0; i < 250; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar( r );

    starsGeometry[ 0 ].vertices.push( vertex );

  }

  for ( i = 0; i < 1500; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar( r );
    
    starsGeometry[ 1 ].vertices.push( vertex );

  }

  var stars;
  var starsMaterials = [
    new THREE.PointCloudMaterial( { color: 0xececec, size: 2, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0xececec, size: 1, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0xdbdbdb, size: 2, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0xdbdbdb, size: 1, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0xbfbfbf, size: 2, sizeAttenuation: false } ),
    new THREE.PointCloudMaterial( { color: 0xbfbfbf, size: 1, sizeAttenuation: false } )
  ];

  for ( i = 10; i < 30; i ++ ) {

    stars = new THREE.PointCloud( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

    stars.rotation.x = Math.random() * 6;
    stars.rotation.y = Math.random() * 6;
    stars.rotation.z = Math.random() * 6;

    stars.position.x = 9000000 * (i - 10) / 20 - 9000000 / 2; //Math.random() * 9000000 - 9000000 / 2;
    //stars.position.z = 1542000;

    stars.matrixAutoUpdate = false;
    stars.updateMatrix();

    this.add( stars );

  }
  
  var sc = 5000;
  var bg;
  
  var backgrounds = [];
  var backgroundGeometry = new THREE.PlaneGeometry(1366 * sc, 768 * sc, 1, 1)

  for(i = 0;i < 4; i ++) {
    var bgd = this.context.resourcesLoader.get("/images/backgrounds/background" + (i + 5) + ".jpg");
    var mat = new THREE.MeshBasicMaterial({map: bgd, transparent : true, depthWrite: false, depthTest: false});
    mat.opacity = 0.25;

    var mesh =  new THREE.Mesh(backgroundGeometry, mat);
    mesh.position.z = -5000000;

    backgrounds.push(mesh);
    this.add(backgrounds[i]);
  }

  backgrounds[0].position.x = -1366 * sc / 2;
  backgrounds[0].position.y = 768 * sc / 2;

  backgrounds[1].position.x = 1366 * sc / 2;
  backgrounds[1].position.y = 768 * sc / 2;

  backgrounds[2].position.x = -1366 * sc / 2;
  backgrounds[2].position.y = -768 * sc / 2;

  backgrounds[3].position.x = 1366 * sc / 2;
  backgrounds[3].position.y = -768 * sc / 2;

  var xGrid = 50;
  var yGrid = 50;

  this.grid =  new THREE.Mesh(new THREE.PlaneGeometry(this.context.areaSize * xGrid, this.context.areaSize * yGrid, xGrid, yGrid), new THREE.MeshBasicMaterial( { color: 0x534D00 , wireframe: true } ));
  this.grid.visible = false;

  this.add(this.grid);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.toggleGrid = function() {
  this.grid.visible = !this.grid.visible;
}