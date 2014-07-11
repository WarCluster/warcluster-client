var InteractiveObject = require("../InteractiveObject");

module.exports = function(size, context) {
  InteractiveObject.call(this);
  
  this.context = context;
  this.size = size;
  this.mission = null;

  var resource;

  switch (size) {
    case 1:
      resource = this.context.resourcesLoader.get("/models/ship1.js");
    break;
    case 2:
      resource = this.context.resourcesLoader.get("/models/ship2.js");
    break;
    case 3:
      resource = this.context.resourcesLoader.get("/models/ship3.js");
    break;
    case 4:
      resource = this.context.resourcesLoader.get("/models/ship4.js");
    break;
    default:
      resource = this.context.resourcesLoader.get("/models/ship4.js");
    break;
  }

  var map = this.context.resourcesLoader.get("/images/ships/ship1.png");
  this.material = new THREE.MeshPhongMaterial({map: map});

  this.ship = new THREE.Mesh(resource.geometry, this.material);
  this.ship.scale.set(0.4, 0.4, 0.4); 
  this.add(this.ship);
  
  this.direction = Math.random() > 0.5 ? 1 : -1;
  this.angle = Math.random() * 360;
  this.formation = null;
}

module.exports.prototype = new InteractiveObject();
module.exports.prototype.send = function() {
  this.position.x = this.formation.x;
  this.position.y = this.formation.y;
  this.position.z = this.formation.z;
}

module.exports.prototype.tick = function(progress) {
  this.angle += this.direction;

  var ind = Math.sin(this.angle*(Math.PI/180))
  var ind2 = Math.sin((180 * progress)*(Math.PI/180))

  this.rotation.y = -0.5 * ind - 0.5;

  this.position.set(this.formation.x * ind2 + ind * 15, this.formation.y * ind2, (this.formation.z + 250) * ind2);
  this.scale.set(ind2, ind2, ind2);
}