module.exports = function(context) {
	THREE.Object3D.call(this);
	
	this.context = context;
	this.mission = null;
	
	this.material = new THREE.MeshBasicMaterial({map: null, transparent: true});

	this.ship = new THREE.Mesh(new THREE.PlaneGeometry(66 * 0.5, 71 * 0.5), this.material);
	this.ship.doubleSided = true;
	this.ship.flipSided = true;
	this.add(this.ship);

	this.progress = 0;
	this.delta_x = 0;
	this.delta_y = 0;

	this.direction = Math.random() > 0.5 ? 3 : -3;
	this.angle = Math.random() * 360;
	console.log(this.direction);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(total) {
	var texture = this.context.resourcesLoader.get("./images/ships/ship1.png");
	this.material.map = texture;
}

module.exports.prototype.send = function(mission) {
	this.mission = mission;

	this.delta_x = this.mission.target.position.x - this.mission.source.position.x;
	this.delta_y = this.mission.target.position.y - this.mission.source.position.y;
	
	this.rotation.z = -Math.atan2(this.delta_x, this.delta_y) + Math.PI;

	var speed = 0.4; // speed per millisecond
	var d = Math.sqrt((this.delta_x*this.delta_x)+(this.delta_y*this.delta_y));
	this.mission.travelTime = d / speed;

	this.displacement = {
		x: Math.random() * 100 - 50,
		y: Math.random() * 100 - 50
	}
}

module.exports.prototype.tick = function() {
	if (this.context.currentTime > this.mission.startTime + this.mission.travelTime) {
		this.context.shipsFactory.destroy(this);
	} else {
		this.progress = (this.context.currentTime - this.mission.startTime) / this.mission.travelTime;
		this.position.x = this.mission.source.position.x + this.delta_x * this.progress;
		this.position.y = this.mission.source.position.y + this.delta_y * this.progress;

		this.angle += this.direction;

		this.ship.position.x = this.displacement.x * (1.3 - this.progress) + 5 * Math.sin(this.angle*(Math.PI/180));
		this.ship.position.y = this.displacement.y * (1.3 - this.progress);
	}
}