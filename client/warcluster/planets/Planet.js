module.exports = function(context, data){
	THREE.Object3D.call(this);
	var _self = this;

	this.sc = 0.3 + Math.random() * 0.4 + 0.5;

	this.context = context;
	this.planetData = data.planetData;

	this.position.x = data.position.x;
  this.position.y = data.position.y;

	this.data = {
		Texture: 1, 
    Size: this.sc, 
    ShipCount: parseInt(50 * this.sc),
    BuildPerTick: 0.01,
    Owner: this.planetData.Owner ? this.planetData.Owner : "gophie"
	};
	
	var pz = Math.random() * (-50);
	var bmd1 = context.resourcesLoader.get("./images/planets/planet1.png");
	var bmd2 = context.resourcesLoader.get("./images/planets/planet_glow.png");

	this.planetSize = {
		width: 225 * this.sc,
		height: 225 * this.sc
	};
	this.planet =  new THREE.Mesh(new THREE.PlaneGeometry(this.planetSize.width, this.planetSize.height, 1, 1), new THREE.MeshBasicMaterial({map: bmd1, transparent : true}));
	this.add(this.planet);

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

	result = this.context.canvasTextFactory.build(this.data.Owner, null, 50);
	this.ownerTexture = new THREE.DataTexture(new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer), result.canvas2d.width, result.canvas2d.height);
	this.ownerMaterial = new THREE.MeshBasicMaterial({map: this.ownerTexture, transparent: true});
	this.ownerMaterial.map.needsUpdate = true;
	this.owner = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.ownerMaterial);
	this.owner.scale.x = result.canvas2d.width*this.sc;
	this.owner.scale.y = result.canvas2d.height*this.sc;
	this.owner.position.set(0, this.planetSize.height * (-0.6), pz + 50);
	this.add(this.owner);

  var circleRadius = this.planetSize.width / 2;
  var circleShape = new THREE.Shape();
  circleShape.moveTo( 0, circleRadius );
  circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
  circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
  circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
  circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius );

  var points = circleShape.createPointsGeometry();
  this.selection = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } ) );
  this.selection.visible = false;
  this.add( this.selection );
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.select = function() {
	this.selection.visible = true;
}

module.exports.prototype.deselect = function() {
	this.selection.visible = false;
}

module.exports.prototype.isSelected = function() {
  return this.selection.visible;
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

module.exports.prototype.rectHitTest = function(rect) {
	var halfSize = this.planetSize.width / 2;
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