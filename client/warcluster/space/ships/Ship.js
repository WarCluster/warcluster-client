var InteractiveObject = require("../InteractiveObject");

module.exports = function(size, context) {
	InteractiveObject.call(this);
	
	this.context = context;
	this.size = size;
	this.mission = null;

	var resource;

	switch (size) {
		case 1:
			resource = this.context.resourcesLoader.get("./models/ship1.js");
		break;
		case 2:
			resource = this.context.resourcesLoader.get("./models/ship2.js");
		break;
		case 3:
			resource = this.context.resourcesLoader.get("./models/ship3.js");
		break;
		case 4:
			resource = this.context.resourcesLoader.get("./models/ship4.js");
		break;
		default:
			resource = this.context.resourcesLoader.get("./models/ship4.js");
		break;
	}

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

module.exports.prototype = new InteractiveObject();
module.exports.prototype.send = function() {
	var len = this.context.objects.length;
	for (var i = 0; i < len; i++) {
		if (this.context.objects[i].data && this.context.objects[i].data.Name === this.mission.data.Source)
			this.source =  this.context.objects[i].data;
		if (this.context.objects[i].data && this.context.objects[i].data.Name === this.mission.data.Target)
			this.target = this.context.objects[i].data;
	}
	
	this.delta_x = this.target.Position.X - this.source.Position.X;
	this.delta_y = this.target.Position.Y - this.source.Position.Y;
	
	this.rotation.z = -Math.atan2(this.delta_x, this.delta_y) + Math.PI;
	this.ship.rotation.y = Math.PI * Math.random();

	this.endTime = this.mission.data.StartTime + this.mission.data.TravelTime;

	this.ship.position.x = this.formation.x;
	this.ship.position.y = this.formation.y;
	this.ship.position.z = this.formation.z;
}

module.exports.prototype.tick = function() {
	if (this.context.currentTime > this.endTime) {
		this.mission.destroy(this);
	} else {
		this.progress = (this.context.currentTime - this.mission.data.StartTime) / this.mission.data.TravelTime;

		if (this.progress > 1)
			this.progress = 1;

		this.position.x = this.source.Position.X + this.delta_x * this.progress;
		this.position.y = this.source.Position.Y + this.delta_y * this.progress;

		this.angle += this.direction;

		var ind = Math.sin(this.angle*(Math.PI/180))
		var ind2 = Math.sin((180 * this.progress)*(Math.PI/180))

		this.ship.rotation.y = -0.5 * ind - 0.5;

		this.ship.position.x = this.formation.x * ind2 + ind * 15;
		this.ship.position.y = this.formation.y * ind2;
		this.ship.position.z = (this.formation.z + 250) * ind2;
	}
}