module.exports = function(context, data){
	THREE.Object3D.call(this);

  this.selected = false;
	this.context = context;

	if (!module.exports.sphereGeometry)
    module.exports.sphereGeometry = new THREE.SphereGeometry(1, 12, 12);

  if (!module.exports.planeGeometry)
    module.exports.planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);

  this.planet =  new THREE.Mesh(module.exports.sphereGeometry);
  this.add(this.planet);

  this.hitObject = this.planet;

  var spriteMaterial = new THREE.SpriteMaterial({
    map: this.context.resourcesLoader.get("/images/planets/planet_glow.png"),
    useScreenCoordinates: false,
    color: 0xFFFFFF, transparent: false, blending: THREE.AdditiveBlending,
    depthWrite: false, depthTest: false
  });
  spriteMaterial.opacity = 0.3;

  this.glow = new THREE.Sprite( spriteMaterial );
  this.add(this.glow);

  var selectionGlow = this.context.resourcesLoader.get("/images/planets/planet_selection_glow.png");

  this.selection =  new THREE.Mesh(module.exports.planeGeometry, new THREE.MeshBasicMaterial({map: selectionGlow, transparent : true}));
  this.selection.visible = false;
  this.add(this.selection);

  this.populationTexture = new THREE.DataTexture();
  this.populationMaterial = new THREE.MeshBasicMaterial({map: this.populationTexture, transparent : true, depthWrite: false, depthTest: false })
  this.populationMaterial.map.needsUpdate = true;
  this.population = new THREE.Mesh(module.exports.planeGeometry, this.populationMaterial);
  this.population.visible = false;

  this.add(this.population);


  this.ownerTexture = new THREE.DataTexture();

  this.ownerMaterial = new THREE.MeshBasicMaterial({ map: this.ownerTexture, transparent : true, depthWrite: false, depthTest: false });
  this.owner = new THREE.Mesh(module.exports.planeGeometry, this.ownerMaterial);
  this.owner.visible = false;

  this.add(this.owner);


  var ringMap = this.context.resourcesLoader.get("/images/planets/ring.png");
  this.ring = new THREE.Mesh(module.exports.planeGeometry, new THREE.MeshBasicMaterial({
    map: ringMap, transparent : true,
    depthWrite: false, depthTest: false
  }))

  this.ring.visible = false;
  this.add(this.ring);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(data) {
  this.data = data;
  this.data.width = 90 + 10 * this.data.Size;
  this.data.height = 90 + 10 * this.data.Size;

  this.position.x = this.data.Position.X;
  this.position.y = this.data.Position.Y;

  this.updateColor();

  this.planet.scale.set(this.data.width / 2, this.data.width / 2, this.data.width / 2);

  this.glow.scale.set(this.data.width * 1.365, this.data.width * 1.365, 1);
  this.selection.scale.set(this.data.width*1.35 , this.data.height*1.35 , 1);

  this.ring.visible = this.data.IsHome;
  this.ring.scale.set(this.data.width * 1.5, this.data.width * 0.8, this.data.width * 1.5);

  this.updatePopulationInfo();

  this.population.visible = this.data.ShipCount != -1 && this.data.Owner == this.context.playerData.Username;
  this.population.position.set(0, this.data.height * (0.78), 0);

  this.updateOwnerInfo();
  this.owner.position.set(0,this.data.height * (-0.78),0);
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
  var mat = this.context.planetsTextureManager.build(this.data);
  if (mat != this.planet.material)
    this.planet.material = this.context.planetsTextureManager.build(this.data);

  this.glow.material.color.setRGB(this.data.Color.R, this.data.Color.G, this.data.Color.B);
}

module.exports.prototype.updatePopulationInfo = function() {
  var population = parseInt(this.data.ShipCount)+ " / " + parseInt(this.data.MaxShipCount);
  var result = this.context.canvasTextFactory.buildUint8Array(population, null, 45);

  // this.population.visible = (this.data.ShipCount !== -1);
  this.populationTexture.image.data = result.uint8Array;
  this.populationTexture.image.width = result.canvas2d.width;
  this.populationTexture.image.height = result.canvas2d.height;

  this.populationMaterial.map.needsUpdate = true;

  this.population.scale.x = result.canvas2d.width;
  this.population.scale.y = result.canvas2d.height;

  if (this.data.ShipCount == -1) {
    this.population.visible = false;
    return;
  } else
    this.population.visible = true;

  //console.log("-updatePopulationInfo-")
}

module.exports.prototype.updateOwnerInfo = function() {
  if (!this.data.Owner) {
    this.owner.visible = false;
    return;
  } else
    this.owner.visible = true;

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

  //this.population.visible = this.data.Owner == "" || this.data.Owner == this.context.playerData.Username;
  this.population.visible = this.data.ShipCount != -1 && this.data.Owner == this.context.playerData.Username;

  var mat = this.context.planetsTextureManager.build(this.data);
  if (mat != this.planet.material)
    this.planet.material = this.context.planetsTextureManager.build(this.data);

  //console.log("-updateOwnerInfo-")
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
  worldPosition.setFromMatrixPosition(this.matrixWorld);
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