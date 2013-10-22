module.exports = function(context, data){
	THREE.Object3D.call(this);
	
  this.selected = false;
	this.context = context;

	this.position.x = data.x;
  this.position.y = data.y;
  
	this.data = data;
  this.data.width = 90 + 10 * this.data.Size;
  this.data.height = 90 + 10 * this.data.Size;

	var pz = Math.random() * (-50);
	var bmd1 = context.resourcesLoader.get("./images/planets/planet"+this.data.Texture+".png");
	var selectionGlow = context.resourcesLoader.get("./images/planets/planet_selection_glow.png");

  var color = new THREE.Color().setRGB(this.data.Color.R/255, this.data.Color.G/255, this.data.Color.B/255);

	this.planet =  new THREE.Mesh(new THREE.SphereGeometry(this.data.width / 2, 12, 12), new THREE.MeshLambertMaterial({map: bmd1, color: color, ambient: color}));
	this.add(this.planet);

  this.hitObject = this.planet;

  this.selection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.35, this.data.height*1.35, 1, 1), new THREE.MeshBasicMaterial({map: selectionGlow, transparent : true}));
  this.selection.visible = false;
  this.add(this.selection);

	//TODO: refactor for DRY(Don't Repeat Yourself)
	var result = this.context.canvasTextFactory.buildUint8Array(this.data.ShipCount, null, 45);

  var ww = result.canvas2d.width;
  var hh = result.canvas2d.height;

	this.populationTexture = new THREE.DataTexture(result.uint8Array, result.canvas2d.width, result.canvas2d.height);
	this.populationMaterial = new THREE.MeshBasicMaterial({map: this.populationTexture, transparent : true})
	this.populationMaterial.map.needsUpdate = true;
	this.population = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.populationMaterial);
	this.population.scale.set(ww, hh, 1.0);
	this.population.position.set(0, this.data.height * (0.78), pz + 50);
  this.population.visible = this.data.Owner == "" || this.data.Owner == this.context.playerData.Username;

	this.add(this.population);
  
  if (this.data.Owner) {
    result = this.context.canvasTextFactory.buildUint8Array(this.data.Owner, null, 45);

    this.ownerTexture = new THREE.DataTexture(result.uint8Array, result.canvas2d.width, result.canvas2d.height);
    this.activate();
  } else {
    this.ownerTexture = new THREE.DataTexture();
  }

  ww = result.canvas2d.width;
  hh = result.canvas2d.height;

  this.ownerMaterial = new THREE.MeshBasicMaterial({ map: this.ownerTexture, transparent: true});
  this.owner = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.ownerMaterial);
  this.owner.scale.set(ww, hh, 1.0);
  this.owner.position.set(0,this.data.height * (-0.78),0);

  if (this.data.Owner) 
    this.ownerMaterial.map.needsUpdate = true;
  else 
    this.owner.visible = false;

  this.add(this.owner);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.select = function() {
  this.selection.material.color.set(module.exports.colors.select);
	this.selection.visible = true;
  this.selected = true;
}

module.exports.prototype.deselect = function() {
	this.selection.visible = false;
  this.selected = false;
}

module.exports.prototype.showAttackSelection = function() {
  this.selection.material.color.set(module.exports.colors.attack);
  this.selection.visible = true;
}

module.exports.prototype.hideAttackSelection = function() {
  this.selection.visible = false;
}

module.exports.prototype.showSpySelection = function() {
  this.selection.material.color.set(module.exports.colors.spy);
  this.selection.visible = true;
}

module.exports.prototype.hideSpySelection = function() {
  this.selection.visible = false;
}

module.exports.prototype.showHoverSelection = function() {
  this.selection.material.color.set(module.exports.colors.over);
  this.selection.visible = true;
}

module.exports.prototype.hideHoverSelection = function() {
  this.selection.visible = this.selected;
  if (this.selected)
    this.selection.material.color.set(module.exports.colors.select);
}

module.exports.prototype.showSupportSelection = function() {
  this.selection.material.color.set(module.exports.colors.support);
  this.selection.visible = true;
}

module.exports.prototype.hideSupportSelection = function() {
  this.selection.visible = this.selected;
  if (this.selected)
    this.selection.material.color.set(module.exports.colors.select);
}

module.exports.prototype.updateColor = function() {
  this.planet.material.color.setRGB(this.data.Color.R/255, this.data.Color.G/255, this.data.Color.B/255);
  this.planet.material.ambient.setRGB(this.data.Color.R/255, this.data.Color.G/255, this.data.Color.B/255);
}

module.exports.prototype.updatePopulationInfo = function() {
  var result = this.context.canvasTextFactory.buildUint8Array(parseInt(this.data.ShipCount), null, 45);
  this.populationTexture.image.data = result.uint8Array;
  this.populationTexture.image.width = result.canvas2d.width;
  this.populationTexture.image.height = result.canvas2d.height;

  this.populationMaterial.map.needsUpdate = true;

  this.population.scale.x = result.canvas2d.width;
  this.population.scale.y = result.canvas2d.height;
}

module.exports.prototype.updateOwnerInfo = function() {
  var result = this.context.canvasTextFactory.buildUint8Array(this.data.Owner || " ", null, 45);
  this.ownerTexture.image.data = new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer);
  this.ownerTexture.image.width = result.canvas2d.width;
  this.ownerTexture.image.height = result.canvas2d.height;

  this.ownerMaterial.map.needsUpdate = true;

  this.owner.scale.x = result.canvas2d.width;
  this.owner.scale.y = result.canvas2d.height;

  this.owner.visible = true;

  if (this.data.Owner == this.context.playerData.Username)
    this.activate();

  this.population.visible = this.data.Owner == "" || this.data.Owner == this.context.playerData.Username;
}

module.exports.prototype.activate = function() {
  var index = this.context.planets.indexOf(this);
  if (index == -1)
    this.context.planets.push(this);
}

module.exports.prototype.deactivate = function() {
  var index = this.context.planets.indexOf(this);
  if (index != -1)
    this.context.planets.splice(index, 1);
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

module.exports.colors = {
  select: 0xFFFFFF,
  over: 0xffa800,
  attack: 0xd80e0e,
  support: 0x12d80e,
  spy: 0xfff717
};

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