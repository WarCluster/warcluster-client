module.exports = function(context) {
  var self = this;
  this.context = context;
  var homePlanet = this.context.playerData.HomePlanet.Position;

  KeyboardJS.KeyboardJS.on('w, up', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,-self.context.windowCenterY);
  });
  KeyboardJS.KeyboardJS.on('a, left', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(-self.context.windowCenterX,self.context.windowCenterY); 
  });
  KeyboardJS.KeyboardJS.on('d, right', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX*3,self.context.windowCenterY); 
  });
  KeyboardJS.KeyboardJS.on('s, down', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,self.context.windowCenterY*3);
  });
  KeyboardJS.KeyboardJS.on('w + a, up + left', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(0,0);
  });
  KeyboardJS.KeyboardJS.on('w + d, up + right', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX*2,0);
  });
  KeyboardJS.KeyboardJS.on('s + d, s + right', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX*2,self.context.windowCenterY*2);
  });
  KeyboardJS.KeyboardJS.on('s + a, s + left', function() {
    self.context.spaceViewController.scroller.scrollToMousePosition(0,self.context.windowCenterY*2);
  });
  KeyboardJS.KeyboardJS.on('space', function() {
    self.context.spaceViewController.scroller.setPosition(homePlanet.X, homePlanet.Y);
    self.context.spaceViewController.info.popover.remove();  
  });
  KeyboardJS.KeyboardJS.on('ctrl',
  //onDownCallback
  function() {
    self.context.spaceViewController.selection.ctrlKey = true;
    if (self.context.spaceViewController.selection.supportTarget) {
      self.context.spaceViewController.selection.handleShowSupportSelection();
      self.context.spaceScene.ctrlKey = true;
    }
  },
  //onUpCallback
  function() {
    self.context.spaceScene.ctrlKey = false;
    self.context.spaceViewController.selection.ctrlKey = false;
    if (self.context.spaceViewController.selection.supportTarget) {
     self.context.spaceViewController.selection.supportTarget.hideSupportSelection();
    }
  });
  KeyboardJS.KeyboardJS.on('shift',
  //onDownCallback
  function() {
    self.context.spaceViewController.selection.shiftKey = true;
    // if (self.context.spaceViewController.selection.supportTarget) {
    //   self.context.spaceViewController.selection.supportTarget.hideSupportSelection();
    // }
  },
  //onUpCallback
  function() {
    self.context.spaceViewController.selection.shiftKey = false;
    // if (self.context.spaceViewController.selection.supportTarget) {
    //   self.context.spaceViewController.selection.handleShowSupportSelection();
    // }
  });

  $(document).keydown(function(e) {
    // number buttons from 1 to 5
    if (e.keyCode > 48 && e.keyCode < 54) {
      self.context.missionsMenu.switchType(e.keyCode - 48);
    }
  });
}