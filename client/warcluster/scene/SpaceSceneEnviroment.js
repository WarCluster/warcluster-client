module.exports = function(context){
  THREE.Object3D.call(this);
  var _self = this;

  this.context = context;

  var _self = this;
  var mouse = { x: 0, y: 0 };

  var bgd1 = this.context.resourcesLoader.get("./images/backgrounds/background1.jpg");
  var bgd2 = this.context.resourcesLoader.get("./images/backgrounds/background3.jpg");

  var i;

  // stars
  var radius = 2500000;
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
    new THREE.ParticleBasicMaterial( { color: 0xececec, size: 2, sizeAttenuation: false } ),
    new THREE.ParticleBasicMaterial( { color: 0xececec, size: 1, sizeAttenuation: false } ),
    new THREE.ParticleBasicMaterial( { color: 0xdbdbdb, size: 2, sizeAttenuation: false } ),
    new THREE.ParticleBasicMaterial( { color: 0xdbdbdb, size: 1, sizeAttenuation: false } ),
    new THREE.ParticleBasicMaterial( { color: 0xbfbfbf, size: 2, sizeAttenuation: false } ),
    new THREE.ParticleBasicMaterial( { color: 0xbfbfbf, size: 1, sizeAttenuation: false } )
  ];

  for ( i = 10; i < 30; i ++ ) {

    stars = new THREE.ParticleSystem( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

    stars.rotation.x = Math.random() * 6;
    stars.rotation.y = Math.random() * 6;
    stars.rotation.z = Math.random() * 6;

    stars.position.x = 9000000 * (i - 10) / 20 - 9000000 / 2; //Math.random() * 9000000 - 9000000 / 2;

    /*s = i * 10;
    stars.scale.set( s, s, s );*/

    stars.matrixAutoUpdate = false;
    stars.updateMatrix();

    this.add( stars );

  }
  
  var sc = 5000;
  var bg;
  
  var backgrounds = [];

  for(i = 0;i < 4; i ++) {
    var bgd = this.context.resourcesLoader.get("./images/backgrounds/background" + (i + 5) + ".jpg");
    var mat = new THREE.MeshBasicMaterial({map: bgd, transparent : true});
    mat.opacity = 0.2;

    var mesh =  new THREE.Mesh(new THREE.PlaneGeometry(1366 * sc, 768 * sc, 1, 1), mat);
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
}

module.exports.prototype = new THREE.Object3D();