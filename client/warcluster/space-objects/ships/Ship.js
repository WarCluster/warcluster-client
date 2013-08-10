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

	var angle = Math.random() * 360;
	var l = Math.random() * 200;
	var l2 = Math.random() * 100 - 50;

	this.displacement = {
		x: Math.random() * 100 - 50,
		y: Math.random() * 100 - 50,
		z: 100 * Math.random() - 50,
		xx: l*Math.sin(angle*(Math.PI/180)),
		yy: l2,
		zz: l*Math.cos(angle*(Math.PI/180))
	}

	this.index = 0;
	this.ship.rotation.y = Math.PI * Math.random();
}

module.exports.prototype.tick = function() {
	if (this.context.currentTime > this.mission.startTime + this.mission.travelTime) {
		this.context.shipsFactory.destroy(this);
	} else {
		this.progress = (this.context.currentTime - this.mission.startTime) / this.mission.travelTime;

		if (this.progress > 1)
			this.progress = 1;

		this.position.x = this.mission.source.x + this.delta_x * this.progress;
		this.position.y = this.mission.source.y + this.delta_y * this.progress;

		this.angle += this.direction;
		this.ship.rotation.y += 0.004 * this.direction;

		if (this.progress <= 0.4)
			this.index = 0.2 + this.progress / 0.4;
		else if (this.progress > 0.4)
			this.index = 0.2 + (1 - (this.progress - 0.4) / 0.6);

		this.ship.position.x = this.displacement.xx * this.index;
		this.ship.position.y = this.displacement.yy * this.index;
		this.ship.position.z = this.displacement.zz * this.index;
	}
}