module.exports.toScreenXY = function ( position, camera, $container ) {
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

module.exports.toWorldPosition = function(target) {
  if (!target)
    return null;
  var worldPosition = new THREE.Vector3();
  worldPosition.getPositionFromMatrix(target.matrixWorld);
  return worldPosition;
}

module.exports.getMouseIntersectionObjects = function(clientX, clientY, objects, context) {
  var mouseX = (clientX / window.innerWidth) * 2 - 1;
  var mouseY = - (clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
  context.projector.unprojectVector( vector, context.camera );

  var raycaster = new THREE.Raycaster(context.camera.position, vector.sub(context.camera.position ).normalize());
  return raycaster.intersectObjects(objects);
}