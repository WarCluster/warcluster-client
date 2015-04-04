module.exports = function(context) {
  var self = this;
  this.context = context;
  var homePlanet = this.context.playerData.HomePlanet.Position;

  // KeyboardJS.KeyboardJS.on('ctrl + shift', function() {
  // });
  KeyboardJS.KeyboardJS.on('ctrl + alt + o', function() {
    self.context.spaceViewController.zoomer.zoomIn();
  });
  KeyboardJS.KeyboardJS.on('ctrl + alt + i', function() {
    self.context.spaceViewController.zoomer.zoomOut();
  });
  KeyboardJS.KeyboardJS.on('w, up', function() {
    self.context.spaceViewController.scroller.scaledScroll(0, self.context.height / 10, true);
  });
  KeyboardJS.KeyboardJS.on('a, left', function() {
    self.context.spaceViewController.scroller.scaledScroll(-self.context.width / 10, 0, true); 
  });
  KeyboardJS.KeyboardJS.on('d, right', function() {
    self.context.spaceViewController.scroller.scaledScroll(self.context.width / 10, 0, true); 
  });
  KeyboardJS.KeyboardJS.on('s, down', function() {
    self.context.spaceViewController.scroller.scaledScroll(0, -self.context.height / 10, true);
  });

  KeyboardJS.KeyboardJS.on('space', function() {
    self.context.spaceViewController.scroller.scrollTo(homePlanet.X, homePlanet.Y, true);
  });

  KeyboardJS.KeyboardJS.on('escape', function() {
    self.context.spaceViewController.selection.removeWaypoints();
  });

  KeyboardJS.KeyboardJS.on('ctrl + enter', function() {
    self.context.spaceScene.enviroment.toggleGrid();
  });

  KeyboardJS.KeyboardJS.on('m', function() {
    //self.context.spaceViewController.toggleMapView();
  });
  
  KeyboardJS.KeyboardJS.on('ctrl',
  //onDownCallback
  function() {
    self.context.spaceViewController.pressCtrlKey();
  },
  //onUpCallback
  function() {
    self.context.spaceViewController.releaseCtrlKey();
  });
  KeyboardJS.KeyboardJS.on('shift',
  //onDownCallback
  function() {
    self.context.spaceViewController.pressShiftKey();
  },
  //onUpCallback
  function() {
    self.context.spaceViewController.releaseShiftKey();
  });

  $(document).keydown(function(e) {
    // number buttons from 0 to 9
    if (e.keyCode > 47 && e.keyCode < 58) {
      self.context.missionsMenu.switchType(e.keyCode - 48);
    }
  });
}