module.exports = function(context, data){
	THREE.Object3D.call(this);
	var _self = this;
	var buildingRate;
	var buildPerTickArr = {
		"homePlanet": 	0.01,
		"littePlanet": 	0.025,
		"mediumPlanet": 0.033,
		"bigPlanet": 	0.05
	};//https://github.com/altras/WarCluster/wiki/Planets

	this.context = context;
	this.planetData = data;

	 if(this.planetData.data.Owner === "") {
	 	buildingRate = 0;
	 } else if (this.planetData.data.Size <= 2) {
	 	buildingRate = buildPerTickArr["littePlanet"];
	 } else if ((this.planetData.data.Size > 2) &&  (this.planetData.data.Size <= 5)) {
	 	buildingRate = buildPerTickArr["mediumPlanet"];
	 } else {
	 	buildingRate = buildPerTickArr["bigPlanet"];
	 }

	this.data = {
		Texture: this.planetData.data.Texture, 
	    Size: this.planetData.data.Size, 
	    ShipCount: this.planetData.data.ShipCount,
	    BuildPerTick: buildingRate,
	    Owner:  this.planetData.data.Owner
	};
	this.planetSizeCoef =  0.3 + Math.random() * 0.4;
	var pz = Math.random() * (-50);

	var bmd1 = context.resourcesLoader.get("./images/planets/planet"+this.data.Texture+".png");

	this.planetSize = {
		width:  225 * this.planetSizeCoef,
		height: 225 * this.planetSizeCoef
	};
	this.planet =  new THREE.Mesh(new THREE.PlaneGeometry(this.planetSize.width, this.planetSize.height, 1, 1), new THREE.MeshBasicMaterial({map: bmd1, transparent : true}));
	// this.planet.scale.x = this.planetSizeCoef;
	// this.planet.scale.y = this.planetSizeCoef;
	this.planet.z = pz;
	this.add(this.planet);

	//TODO: refactor for DRY(Don't Repeat Yourself)
	var result = this.context.canvasTextFactory.build(this.data.ShipCount, null, 50);
	this.titleTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);
	this.titleMaterial = new THREE.MeshBasicMaterial({map: this.titleTexture, transparent : true});
	this.titleMaterial.map.needsUpdate = true;
	this.title = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.titleMaterial);
	this.title.scale.x = result.canvas2d.width*this.planetSizeCoef;
	this.title.scale.y = result.canvas2d.height*this.planetSizeCoef;
	this.title.position.z = pz + 50;

	this.add(this.title);
	this.hitObject = this.planet;

	result = this.context.canvasTextFactory.build(this.data.Owner, null, 50);
	this.ownerTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);
	this.ownerMaterial = new THREE.MeshBasicMaterial({map: this.ownerTexture, transparent: true});
	this.ownerMaterial.map.needsUpdate = true;
	this.owner = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.ownerMaterial);
	this.owner.scale.x = result.canvas2d.width*this.planetSizeCoef;
	this.owner.scale.y = result.canvas2d.height*this.planetSizeCoef;
	this.owner.position.set(0, this.planetSize.height * (-0.8), pz + 50);
	this.add(this.owner);

	/*this.hitObject = new THREE.Mesh(new THREE.SphereGeometry(90*this.planetSizeCoef), new THREE.MeshBasicMaterial());
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

	this.title.scale.x = result.canvas2d.width*this.planetSizeCoef;
	this.title.scale.y = result.canvas2d.height*this.planetSizeCoef;
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
