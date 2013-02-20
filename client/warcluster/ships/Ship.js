module.exports = function(context) {
	THREE.Object3D.call(this);
	
	this.context = context;
	this.target = null;
	
	var texture = this.context.resourcesLoader.get("./images/ships/ship1.png");
	var material = new THREE.MeshBasicMaterial({map: texture, transparent: true});

	this.ship = new THREE.Mesh(new THREE.PlaneGeometry(66 * 0.5, 71 * 0.5), material);
	this.ship.doubleSided = true;
	this.ship.flipSided = true;
	this.add(this.ship);

	this.delta_x = 0;
	this.delta_y = 0;

	this.sp = 5
	this.speed = {
		x: 0,
		y: 0
	}
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.send = function(target) {
	this.targetX = target.position.x;
	this.targetY = target.position.y;

	this.delta_x = target.position.x - this.position.x;
	this.delta_y = target.position.y - this.position.y;
	
	this.rotation.z = -Math.atan2(this.delta_x, this.delta_y) + Math.PI;

	this.speed.x = this.sp * Math.sin(this.rotation.z);
	this.speed.y = this.sp * Math.cos(this.rotation.z);
}

module.exports.prototype.tick = function() {
	this.position.x += this.speed.x;
	this.position.y -= this.speed.y;

	this.delta_x = this.targetX - this.position.x;
	this.delta_y = this.targetY - this.position.y;

	if (Math.sqrt((this.delta_x*this.delta_x)+(this.delta_y*this.delta_y)) < 10)
		this.context.shipsFactory.destroy(this);
}