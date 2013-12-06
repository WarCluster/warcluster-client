module.exports = function(context) {
  var self = this;
  this.context = context;
  var keymap = {};
  var homePlanet = this.context.playerData.HomePlanet.Position;

  $(document).keydown(function(e) {
    switch (e.keyCode) {
      //left arrow
      case 37 && 65:
        self.context.spaceViewController.scroller.scrollToMousePosition(-self.context.windowCenterX,self.context.windowCenterY); 
      break;
      //up arrow
      case 38 && 87:
        self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,-self.context.windowCenterY); 
      break;
      //right arrow
      case 39 && 68:
        self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX*3,self.context.windowCenterY); 
      break;
      //down arrow
      case 40 && 83:
        self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,self.context.windowCenterY*3);
      break;
    }
    if (keymap[e.keyCode]) {
      return ;
    }
    keymap[e.keyCode] = true;
    // number buttons from 1 to 5
    if (e.keyCode > 48 && e.keyCode < 54) {
      self.context.missionsMenu.switchType(e.keyCode - 48);
    }
    // ctrl
    else if(e.keyCode === 17) {
      self.context.spaceViewController.selection.ctrlKey = true;
      if (self.context.spaceViewController.selection.supportTarget) {
        self.context.spaceViewController.selection.handleShowSupportSelection();
        self.context.spaceScene.ctrlKey = true;
      }
    }
    // shift
    else if(e.keyCode === 16) {
    	self.context.spaceViewController.selection.shiftKey = true;
    	if (self.context.spaceViewController.selection.supportTarget) {
		    self.context.spaceViewController.selection.supportTarget.hideSupportSelection();
      }
    }
  });

  $(document).keyup(function(e) {
  	delete keymap[e.keyCode];
    //spacebar
    if (e.keyCode === 32) {
      self.context.spaceViewController.scroller.setPosition(homePlanet.X, homePlanet.Y);
      self.context.spaceViewController.info.popover.remove();
    }
    //ctrl
    if (e.keyCode === 17) {
      self.context.spaceScene.ctrlKey = false;
      self.context.spaceViewController.selection.ctrlKey = false;
    	if (self.context.spaceViewController.selection.supportTarget) {
			 self.context.spaceViewController.selection.supportTarget.hideSupportSelection();
    	}
    }
    //shift
    else if (e.keyCode === 16) {
    	self.context.spaceViewController.selection.shiftKey = false;
    	if (self.context.spaceViewController.selection.supportTarget) {
    		self.context.spaceViewController.selection.handleShowSupportSelection();
    	}
    }
  });
}