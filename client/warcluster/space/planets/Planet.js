module.exports = function(context, data){
	THREE.Object3D.call(this);
	
  this.selected = false;
	this.context = context;

  var selectionGlow = context.resourcesLoader.get("/images/planets/planet_selection_glow.png");
  
  this.planet =  new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshLambertMaterial());
  this.add(this.planet);

  this.hitObject = this.planet;

  this.selection =  new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), new THREE.MeshBasicMaterial({map: selectionGlow, transparent : true}));
  this.add(this.selection);

	//TODO: refactor for DRY(Don't Repeat Yourself)
	var result = this.context.canvasTextFactory.buildUint8Array(0, null, 45);

  var ww = result.canvas2d.width;
  var hh = result.canvas2d.height;

	this.populationTexture = new THREE.DataTexture(result.uint8Array, result.canvas2d.width, result.canvas2d.height);
	this.populationMaterial = new THREE.MeshBasicMaterial({map: this.populationTexture, transparent : true})
	this.populationMaterial.map.needsUpdate = true;
	this.population = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.populationMaterial);

	this.add(this.population);

  var result = this.context.canvasTextFactory.buildUint8Array(" ", null, 45);

  this.ownerTexture = new THREE.DataTexture(result.uint8Array, result.canvas2d.width, result.canvas2d.height);
  this.ownerMaterial = new THREE.MeshBasicMaterial({ map: this.ownerTexture, transparent: true});
  this.owner = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.ownerMaterial);

  this.add(this.owner);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(data) {
  this.position.x = data.Position.X;
  this.position.y = data.Position.Y;

  this.data = data;
  this.planetSize = 90 + 10 * this.data.Size;

  this.planet.scale.set(this.planetSize, this.planetSize, this.planetSize);
  this.selection.scale.set(this.planetSize*1.35, this.planetSize*1.35, this.planetSize*1.35);
  this.selection.visible = false;

  this.planet.material.map = this.context.resourcesLoader.get("/images/planets/planet"+this.data.Texture+".png");

  this.updateColor();
  this.updatePopulationInfo();
  this.updateOwnerInfo();

  if (this.data.IsHome && !this.ring) {
    var pz = Math.random() * (-50);
    var ring = this.context.resourcesLoader.get("/images/planets/ring.png");
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(this.planetSize*1.35, this.planetSize*1.35, 1, 1), new THREE.MeshBasicMaterial({map: ring, transparent : true}))
    this.ring.position.setZ(pz + 250);
    this.ring.rotateX(0.99);
    this.add(this.ring);
  } else if (this.ring) {
    this.remove(this.ring);
    this.ring = null;
  }
}

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
  this.planet.material.color.setRGB(this.data.Color.R, this.data.Color.G, this.data.Color.B);
  this.planet.material.ambient.setRGB(this.data.Color.R, this.data.Color.G, this.data.Color.B);
}

module.exports.prototype.updatePopulationInfo = function() {
  if (this.data.ShipCount !== -1) {
    var result = this.context.canvasTextFactory.buildUint8Array(parseInt(this.data.ShipCount), null, 45);
  
    this.population.visible = (this.data.ShipCount !== -1);
    this.populationTexture.image.data = result.uint8Array;
    this.populationTexture.image.width = result.canvas2d.width;
    this.populationTexture.image.height = result.canvas2d.height;

    this.populationMaterial.map.needsUpdate = true;

    this.population.scale.x = result.canvas2d.width;
    this.population.scale.y = result.canvas2d.height;
    this.population.position.set(0, this.planetSize * (0.78), 50);
    this.population.visible = true;
  } else
    this.population.visible = false;
}

module.exports.prototype.updateOwnerInfo = function() {
  if (this.data.Owner) {
    var result = this.context.canvasTextFactory.buildUint8Array(this.data.Owner || " ", null, 45);
    this.ownerTexture.image.data = new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer);
    this.ownerTexture.image.width = result.canvas2d.width;
    this.ownerTexture.image.height = result.canvas2d.height;

    this.ownerMaterial.map.needsUpdate = true;

    this.owner.scale.set(result.canvas2d.width, result.canvas2d.height, 1.0);
    this.owner.position.set(0, this.planetSize * (-0.78), 0);

    this.owner.visible = true;

    if (this.data.Owner == this.context.playerData.Username)
      this.activate();

    this.population.visible = this.data.Owner == "" || this.data.Owner == this.context.playerData.Username;
  } else {
    this.deactivate();
    this.owner.visible = false;
  }
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
	var halfSize = this.planetSize / 2;
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