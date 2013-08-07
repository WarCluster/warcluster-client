module.exports = function(context, data){
	THREE.Object3D.call(this);
	var _self = this;

	this.sc = 0.3 + Math.random() * 0.4 + 0.5;
  this.selected = false;

	this.context = context;
	this.planetData = data.planetData;

	this.position.x = data.position.x;
  this.position.y = data.position.y;
  
	this.data = data.planetData;
  this.data.width = 130 + 20 * this.data.Size,
  this.data.height = 130 + 20 * this.data.Size
	
	var pz = Math.random() * (-50);
	var bmd1 = context.resourcesLoader.get("./images/planets/planet1.png");
	var bmd2 = context.resourcesLoader.get("./images/planets/planet_selection_glow.png");
  var bmd3 = context.resourcesLoader.get("./images/planets/planet_support_glow.png");
  var bmd4 = context.resourcesLoader.get("./images/planets/planet_attack_glow.png");

	this.planet =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width, this.data.height, 1, 1), new THREE.MeshBasicMaterial({map: bmd1, transparent : true}));
	this.add(this.planet);

  this.selection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.2, this.data.height*1.2, 1, 1), new THREE.MeshBasicMaterial({map: bmd2, transparent : true}));
  this.selection.visible = false;
  this.add(this.selection);

  this.supportSelection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.2, this.data.height*1.2, 1, 1), new THREE.MeshBasicMaterial({map: bmd3, transparent : true}));
  this.supportSelection.visible = false;
  this.add(this.supportSelection);

  this.attackSelection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.2, this.data.height*1.2, 1, 1), new THREE.MeshBasicMaterial({map: bmd4, transparent : true}));
  this.attackSelection.visible = false;
  this.add(this.attackSelection);

	//TODO: refactor for DRY(Don't Repeat Yourself)
	var result = this.context.canvasTextFactory.build(this.data.ShipCount, null, 50);
	this.titleTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);
	this.titleMaterial = new THREE.MeshBasicMaterial({map: this.titleTexture, transparent : true});
	this.titleMaterial.map.needsUpdate = true;
	this.title = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.titleMaterial);
	this.title.scale.x = result.canvas2d.width*this.sc;
	this.title.scale.y = result.canvas2d.height*this.sc;
	this.title.position.z = pz + 50;

	this.add(this.title);
	this.hitObject = this.planet;

	result = this.context.canvasTextFactory.build(this.data.Owner || " ", null, 50);
	this.ownerTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);
	this.ownerMaterial = new THREE.MeshBasicMaterial({map: this.ownerTexture, transparent: true});
	this.ownerMaterial.map.needsUpdate = true;
	this.owner = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.ownerMaterial);
	this.owner.scale.x = result.canvas2d.width*this.sc;
	this.owner.scale.y = result.canvas2d.height*this.sc;
	this.owner.position.set(0, this.data.height * (-0.6), pz + 50);
	this.add(this.owner);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.select = function() {
	this.selection.visible = true;
  this.selected = true;
}

module.exports.prototype.deselect = function() {
	this.selection.visible = false;
  this.selected = false;
}

module.exports.prototype.showAttackSelection = function() {
  this.attackSelection.visible = true;
}

module.exports.prototype.hideAttackSelection = function() {
  this.attackSelection.visible = false;
}

module.exports.prototype.showSupportSelection = function() {
  this.supportSelection.visible = true;
  this.selection.visible = false;
}

module.exports.prototype.hideSupportSelection = function() {
  this.supportSelection.visible = false;
  this.selection.visible = this.selected;
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

		//this.data.ShipCount += this.data.BuildPerTick;

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

module.exports.prototype.rectHitTest = function(rect) {
	var halfSize = this.data.width / 2;
  var worldPosition = new THREE.Vector3();
  worldPosition.getPositionFromMatrix(this.matrixWorld);
  var sc = this.toScreenXY(worldPosition);

  return sc.x >= rect.x && sc.x <= rect.x + rect.width &&
         sc.y >= rect.y  && sc.y <= rect.y + rect.height;
}

module.exports.prototype.toScreenXY = function (position) {
  var pos = position.clone();
  projScreenMat = new THREE.Matrix4();
  projScreenMat.multiplyMatrices( this.context.camera.projectionMatrix, this.context.camera.matrixWorldInverse );
  pos.applyProjection( projScreenMat )

  return { 
  	x: ( pos.x + 1 ) * this.context.$content.width() / 2 + this.context.$content.offset().left,
    y: ( - pos.y + 1) * this.context.$content.height() / 2 + this.context.$content.offset().top 
  };
}

/*odule.exports.prototype.intersects = function(rect) {
  var circleDistance.x = Math.abs(this.circle.x - rect.x);
  var circleDistance.y = Math.abs(this.circle.y - rect.y);

  if (circleDistance.x > (rect.width/2 + this.circle.r)) 
  	return false;
  if (circleDistance.y > (rect.height/2 + this.circle.r)) 
  	return false;

  if (circleDistance.x <= (rect.width/2)) 
  	return true;
  if (circleDistance.y <= (rect.height/2)) 
  	return true;

  var cornerDistance_sq = Math.sqr(circleDistance.x - rect.width/2) +
                       Math.sqr(circleDistance.y - rect.height/2);

  return (cornerDistance_sq <= Math.sqr(this.circle.r));
}*/