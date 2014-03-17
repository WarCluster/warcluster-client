module.exports = function(size, context) {
	THREE.Object3D.call(this);
	
	this.context = context;
	this.size = size;

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
	this.ship.scale.set(0.3, 0.3, 0.3); 
	this.add(this.ship);

	this.direction = 1;
	this.angle = 0;
	this.formation = null;
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(formation, color) {
	this.direction = Math.random() > 0.5 ? 1 : -1;
	this.angle = Math.random() * 360;
	this.formation = formation;
	this.material.color = color;
	this.material.ambient = color;
}

module.exports.prototype.tick = function(progress) {
	this.angle += this.direction;

	var ind = Math.sin(this.angle*(Math.PI/180))
	var ind2 = Math.sin((180 * progress)*(Math.PI/180))

	this.ship.rotation.y = -0.5 * ind - 0.5;

	this.ship.position.x = this.formation.x * ind2 + ind * 15;
	this.ship.position.y = this.formation.y * ind2;
	this.ship.position.z = (this.formation.z + 250) * ind2;
}