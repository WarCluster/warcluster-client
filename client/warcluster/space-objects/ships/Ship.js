module.exports = function(context, color) {
	THREE.Object3D.call(this);
	
	this.context = context;
	this.mission = null;
	this.total = null;

	var resource = this.context.resourcesLoader.get("./models/ship1.js");
	var map = this.context.resourcesLoader.get("./images/ships/ship1.png");
	this.material = new THREE.MeshPhongMaterial({map: map});

	this.ship = new THREE.Mesh(resource.geometry, this.material);
	this.ship.scale.set(0.35, 0.35, 0.35); 
	this.add(this.ship);
	
	this.progress = 0;
	this.delta_x = 0;
	this.delta_y = 0;

	this.direction = Math.random() > 0.5 ? 3 : -3;
	this.angle = Math.random() * 360;
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(total) {
	this.total = total;
}

module.exports.prototype.send = function(mission) {
	this.mission = mission;

	this.delta_x = this.mission.target.x - this.mission.source.x;
	this.delta_y = this.mission.target.y - this.mission.source.y;
	
	this.rotation.z = -Math.atan2(this.delta_x, this.delta_y) + Math.PI;

	var speed = 0.4; // speed per millisecond
	var d = Math.sqrt((this.delta_x*this.delta_x)+(this.delta_y*this.delta_y));
	//this.mission.travelTime = d / speed;

	this.displacement = {
		x: Math.random() * 100 - 50,
		y: Math.random() * 100 - 50,
		z: 100 * Math.random() - 50
	}
}

module.exports.prototype.tick = function() {
	//console.log("tick:", this.context.currentTime, this.mission.startTime, this.mission.travelTime)
	if (this.context.currentTime > this.mission.startTime + this.mission.travelTime) {
		this.context.shipsFactory.destroy(this);
	} else {
		this.progress = (this.context.currentTime - this.mission.startTime) / this.mission.travelTime;

		if (this.progress > 1)
			this.progress = 1;

		this.position.x = this.mission.source.x + this.delta_x * this.progress;
		this.position.y = this.mission.source.y + this.delta_y * this.progress;

		this.angle += this.direction;

		var ind = Math.sin(this.angle*(Math.PI/180))

		this.ship.rotation.y = 0.6 * ind;

		this.ship.position.x = this.displacement.x * (1 - this.progress) + 10 * ind;
		this.ship.position.y = this.displacement.y * (1 - this.progress) + 3 * ind;

		this.ship.position.z = this.displacement.z * (1 - this.progress);
	}
}