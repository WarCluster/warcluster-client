var InteractiveObject = require("../InteractiveObject");

module.exports = function(context, data){
	InteractiveObject.call(this);
	
  this.selected = false;
  this.prevShipCount = 0;

	this.context = context;
	
	this.position.x = data.position.x;
  this.position.y = data.position.y;
  
	this.data = data.planetData;
  this.data.width = 90 + 10 * this.data.Size;
  this.data.height = 90 + 10 * this.data.Size;
	
  this.updatePopulationProduction();

	var pz = Math.random() * (-50);
	var bmd1 = context.resourcesLoader.get("./images/planets/planet"+this.data.Texture+".png");
	var bmd2 = context.resourcesLoader.get("./images/planets/planet_selection_glow.png");
  var bmd3 = context.resourcesLoader.get("./images/planets/planet_support_glow.png");
  var bmd4 = context.resourcesLoader.get("./images/planets/planet_attack_glow.png");

  var color = new THREE.Color().setRGB(this.data.Color.R/255, this.data.Color.G/255, this.data.Color.B/255);

	this.planet =  new THREE.Mesh(new THREE.SphereGeometry(this.data.width / 2, 12, 12), new THREE.MeshLambertMaterial({map: bmd1, color: color, ambient: color}));
	this.add(this.planet);

  this.selection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.35, this.data.height*1.35, 1, 1), new THREE.MeshBasicMaterial({map: bmd2, transparent : true}));
  this.selection.visible = false;
  this.add(this.selection);

  this.supportSelection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.35, this.data.height*1.35, 1, 1), new THREE.MeshBasicMaterial({map: bmd3, transparent : true}));
  this.supportSelection.visible = false;
  this.add(this.supportSelection);

  this.attackSelection =  new THREE.Mesh(new THREE.PlaneGeometry(this.data.width*1.35, this.data.height*1.35, 1, 1), new THREE.MeshBasicMaterial({map: bmd4, transparent : true}));
  this.attackSelection.visible = false;
  this.add(this.attackSelection);

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
	this.hitObject = this.planet;
  
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
  this.nextTick = this.context.currentTime + 60000;
}

module.exports.prototype = new InteractiveObject();
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

module.exports.prototype.update = function(data) {
  if (this.data.Owner != data.planetData.Owner)
    this.nextTick = this.context.currentTime + 60000;

  var updatePopulation = this.data.ShipCount !== data.planetData.ShipCount && (this.data.Owner === this.context.playerData.Username || this.data.Owner === "")
  var updateOwner = this.data.Owner !== data.planetData.Owner;
  var updateColor = this.data.Color !== data.planetData.Color;
  var currentOwner = this.data.Owner;

  _.extend(this.data, data.planetData);

  if (updatePopulation)
    this.updatePopulationInfo();
  if (updateOwner) {
    if (currentOwner === this.context.playerData.Username) {
      var selectedPlanets = this.context.spaceViewController.selection.selectedPlanets;
      for (var index = 0; index < selectedPlanets.length; index++){
        if (selectedPlanets[index].data.id === data.planetData.id) {
          this.context.spaceViewController.selection.selectedPlanets[index].deselect();
          break;
        }
      }
    }
    this.updateOwnerInfo();
  }
  if (updateColor)
    this.updateColor();
}

module.exports.prototype.hideSupportSelection = function() {
  this.supportSelection.visible = false;
  this.selection.visible = this.selected;
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

  if (this.data.Owner == this.context.playerData.Username) {
    this.updatePopulationProduction();
    this.activate();
  }

  this.population.visible = this.data.Owner == "" || this.data.Owner == this.context.playerData.Username;
}

module.exports.prototype.tick = function() {
  if (this.data.Owner && this.context.currentTime >= this.nextTick) {
    console.log("-tick-")
    this.nextTick = this.context.currentTime + 60000;
    this.data.ShipCount += this.data.BuildPerMinutes;

    this.updatePopulationInfo();  
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

module.exports.prototype.updatePopulationProduction = function () {
  if(this.data.Owner === "") {
    this.data.BuildPerMinutes = 0;
  } else if (this.data.Size <= 2) {
    this.data.BuildPerMinutes = 1;
  } else if ((this.data.Size > 2) &&  (this.data.Size <= 5)) {
    this.data.BuildPerMinutes = 2;
  } else if ((this.data.Size > 5) &&  (this.data.Size <= 8)) {
    this.data.BuildPerMinutes = 3;
  } else if ((this.data.Size > 8) &&  (this.data.Size <= 10)) {
    this.data.BuildPerMinutes = 4;
  }
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