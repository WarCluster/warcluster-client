module.exports = function(context, color) {
	THREE.Object3D.call(this);
	
	this.context = context;
	this.mission = null;
	this.total = null;

	var resource = this.context.resourcesLoader.get("./models/ship1.js");
	var map = this.context.resourcesLoader.get("./images/ships/ship1.png");
	this.material = new THREE.MeshPhongMaterial({map: map});

	this.ship = new THREE.Mesh(resource.geometry, this.material);
	this.ship.scale.set(0.3, 0.3, 0.3); 
	this.add(this.ship);
	
	this.progress = 0;
	this.delta_x = 0;
	this.delta_y = 0;

	this.direction = Math.random() > 0.5 ? 1 : -1;
	this.angle = Math.random() * 360;
	this.formation = null;
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
	var l2 = Math.random() * 400 - 200;

	/*this.displacement = {
		x: Math.random() * 100 - 50,
		y: Math.random() * 100 - 50,
		z: 100 * Math.random() - 50,
		xx: l*Math.sin(angle*(Math.PI/180)),
		yy: l2,
		zz: l*Math.cos(angle*(Math.PI/180))
	}*/

	this.index = 0;
	this.ship.rotation.y = Math.PI * Math.random();
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
		var ind2 = Math.sin((180 * this.progress)*(Math.PI/180))

		//console.log(ind2)
		this.ship.rotation.y = -0.5 * ind - 0.5;

		this.ship.position.x = this.formation.x * ind2 + ind * 15;
		this.ship.position.y = this.formation.y * ind2;
		this.ship.position.z = this.formation.z * ind2;
	}
}