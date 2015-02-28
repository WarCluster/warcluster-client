var UserPopover = require("../../../popovers/UserPopover");

module.exports = function(context){
  THREE.EventDispatcher.call(this);

  var self = this;

  this.context = context;
  this.selectedTooltipPlanet = null;

  this.popover = new UserPopover(this.context);
  this.popover.on("attack", function(id) {
    self.dispatchEvent({
      type: "attackPlanet",
      id: id
    });
  });
  this.popover.on("spy", function(id) {
    self.dispatchEvent({
      type: "spyPlanet",
      id: id
    });
  });
  this.popover.on("supply", function(id) {
    self.dispatchEvent({
      type: "supplyPlanet",
      id: id
    });
  });

  // var click = function(e) {
    
  // }

  window.addEventListener("mouseup", self.renderAt.bind(this));
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.updatePosition = function() {
  if (this.selectedTooltipPlanet) {
    var position = this.getTooltipPosition();
    this.popover.move(position.x, position.y);  
  }
}

module.exports.prototype.renderAt = function(e) {
  if (e.button == 0)
      return ;

    var intersects = this.getMouseIntersectionObjects(e);
    if (intersects.length > 0) {
      this.selectedTooltipPlanet = intersects[0].object.parent;

      var position = this.getTooltipPosition();
      this.popover.show(position.x, position.y, this.selectedTooltipPlanet.data);
    }
}

module.exports.prototype.getMouseIntersectionObjects = function(e) {
  var clientX = e.clientX || e.changedPointers[0].clientX;
  var clientY = e.clientY || e.changedPointers[0].clientY;
  var mouseX = (clientX / window.innerWidth) * 2 - 1;
  var mouseY = - (clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
  this.context.projector.unprojectVector( vector, this.context.camera );

  var raycaster = new THREE.Raycaster(this.context.camera.position, vector.sub(this.context.camera.position ).normalize());
  return raycaster.intersectObjects(this.context.planetsHitObjects);
}

module.exports.prototype.toScreenXY = function ( position, camera, $container ) {
  var pos = position.clone();
  projScreenMat = new THREE.Matrix4();
  projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
  //projScreenMat.multiplyVector3( pos );
  pos.applyProjection( projScreenMat )

  return { 
    x: ( pos.x + 1 ) * $container.width() / 2 + $container.offset().left,
    y: ( - pos.y + 1) * $container.height() / 2 + $container.offset().top 
  };
}

module.exports.prototype.getTooltipPosition = function() {
  if (!this.selectedTooltipPlanet)
    return null;
  var worldPosition = new THREE.Vector3();
  worldPosition.setFromMatrixPosition(this.selectedTooltipPlanet.matrixWorld);
  // worldPosition.x += this.selectedTooltipPlanet.data.width/2;
  return this.toScreenXY(worldPosition, this.context.camera, this.context.$content);
}