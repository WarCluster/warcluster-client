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
	

	
	
	//$(".menu").append(bmd1.image);
	Pixastic.process(bmd1.image, "hsl", {hue:Math.random() * 255, saturation:20, lightness:0}, function(c) {
		/*var context2d = c.getContext('2d');
		var im = new Image();*/
		var tt = new THREE.Texture(new Image());
		tt.image.src = c.toDataURL("image/png")
		tt.image.width = c.width;
		tt.image.height = c.height;
		_self.planet =  new THREE.Mesh(new THREE.PlaneGeometry(225, 225, 1, 1), new THREE.MeshBasicMaterial({map: tt, transparent : true}));
		_self.planet.scale.x = _self.sc;
		_self.planet.scale.y = _self.sc;
		_self.planet.z = pz;
		console.log("I:", tt.image.width, tt.image.height)
		_self.add(_self.planet);
		/*im.width = c.width;
		im.height = c.height;
		im.data = new Uint8Array(context2d.getImageData(0, 0, c.width, c.height).data.buffer);*/

		/*$(".menu").append(c);
		$(".menu").append(im);*/
		
		

		//_self.planet.material = new THREE.MeshBasicMaterial({map: im, transparent : true});
		//this.titleMaterial.map.needsUpdate = true;
		_self.planet.material.map.needsUpdate = true;

		console.log("-------img ready------------", c.width, c.height);
	});

	/*this.glowMaterial = new THREE.MeshBasicMaterial({map: bmd2, transparent : true});
	this.glow = new THREE.Mesh(new THREE.PlaneGeometry(225, 225, 1, 1), this.glowMaterial);
	this.glow.scale.x = this.sc;
	this.glow.scale.y = this.sc;
	this.glow.position.z = pz + 10;
	this.glow.visible = false;
	
	this.add(this.glow);*/

	var result = this.context.canvasTextFactory.build(this.data.ShipCount, null, 50);
	this.titleTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);

	this.titleMaterial = new THREE.MeshBasicMaterial({map: this.titleTexture, transparent : true});
	this.titleMaterial.map.needsUpdate = true;

	this.title = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.titleMaterial);
	this.title.scale.x = result.canvas2d.width*this.sc;
	this.title.scale.y = result.canvas2d.height*this.sc;
	this.title.position.z = pz + 30;

	this.add(this.title);

	this.hitObject = new THREE.Mesh(new THREE.SphereGeometry(90*this.sc));
	this.hitObject.position.z = pz;
	this.hitObject.visible = false;

	this.add(this.hitObject);
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