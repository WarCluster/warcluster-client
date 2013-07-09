module.exports = function(context){
	THREE.Object3D.call(this);
	var _self = this;

	this.sc = 0.3 + Math.random() * 0.4;

	this.context = context;
	this.data = {
		Texture: 1, 
	    Size: this.sc, 
	    ShipCount: parseInt(50 * this.sc),
	    BuildPerTick: 0.01,
	    Owner: Math.random() > 0.5 ? "gophie" : null
	};

	var pz = Math.random() * (-50);
	var bmd1 = context.resourcesLoader.get("./images/planets/planet1.png");
	var bmd2 = context.resourcesLoader.get("./images/planets/planet_glow.png");

	this.planetSize = {
		width: 225 * this.sc,
		height: 225 * this.sc
	};
	this.planet =  new THREE.Mesh(new THREE.PlaneGeometry(this.planetSize.width, this.planetSize.height, 1, 1), new THREE.MeshBasicMaterial({map: bmd1, transparent : true}));

	//this.planet.scale.x = this.sc;
	//this.planet.scale.y = this.sc;
	this.planet.z = pz;
	this.add(this.planet);

	var owner = this.context.canvasTextFactory.build("unknown", null, 50);//this.data.Owner;
	var result = this.context.canvasTextFactory.build(this.data.ShipCount, null, 50);
	this.titleTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);

	this.titleMaterial = new THREE.MeshBasicMaterial({map: this.titleTexture, transparent : true});
	this.titleMaterial.map.needsUpdate = true;

	this.title = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.titleMaterial);
	this.title.scale.x = result.canvas2d.width*this.sc;
	this.title.scale.y = result.canvas2d.height*this.sc;
	this.title.position.z = pz + 30;

	this.add(this.title);
	this.hitObject = this.planet;

	/*this.hitObject = new THREE.Mesh(new THREE.SphereGeometry(90*this.sc), new THREE.MeshBasicMaterial());
	this.hitObject.position.z = pz;
	//this.hitObject.visible = false;

	this.add(this.hitObject);*/
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.select = function() {
	//TweenLite.to(this.glow, 0.3, {alpha: 1, ease: Cubic.easeOut});
	this.glow.visible = true;
}

module.exports.prototype.deselect = function() {
	//TweenLite.to(this.glow, 0.3, {alpha: 0, ease: Cubic.easeOut});
	this.glow.visible = false;
}

module.exports.prototype.updateInfo = function() {
	var result = this.context.canvasTextFactory.build(parseInt(this.data.ShipCount), null, 50);
	this.titleTexture.image.data = new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer);
	this.titleTexture.image.width = result.canvas2d.width;
	this.titleTexture.image.height = result.canvas2d.height;

	this.titleMaterial.map.needsUpdate = true;

	this.title.scale.x = result.canvas2d.width*this.sc;
	this.title.scale.y = result.canvas2d.height*this.sc;
}

module.exports.prototype.tick = function() {
	
	if (this.data.Owner) {
		var prevShipCount = this.data.ShipCount;

		this.data.ShipCount += this.data.BuildPerTick;

		if (parseInt(prevShipCount) != parseInt(this.data.ShipCount))
			this.updateInfo();
	}
}

module.exports.prototype.setOwner = function(value) {
	this.data.Owner = value;
}

module.exports.prototype.getOwner = function() {
	return this.data.Owner;
}