module.exports = function(context) {
  var self = this;
  this.context = context;
  var keymap = {};
  var homePlanet = this.context.playerData.HomePlanet.Position;

  $(document).keydown(function(e) {
    //left arrow || a
    if (e.keyCode == 37 || e.keyCode == 65)
      self.context.spaceViewController.scroller.scrollToMousePosition(-self.context.windowCenterX,self.context.windowCenterY, false); 
    //up arrow || w
    if (e.keyCode == 38 || e.keyCode == 87)
      self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,-self.context.windowCenterY, false); 
    //right arrow || d
    if (e.keyCode == 39 || e.keyCode == 68)
      self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX*3,self.context.windowCenterY, false); 
    //down arrow || s
    if (e.keyCode == 40 || e.keyCode == 83)
      self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,self.context.windowCenterY*3, false);
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
    if (e.keyCode == 37 || e.keyCode == 65)
      self.context.spaceViewController.scroller.scrollToMousePosition(-self.context.windowCenterX,self.context.windowCenterY, true); 
    //up arrow || w
    if (e.keyCode == 38 || e.keyCode == 87)
      self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,-self.context.windowCenterY, true); 
    //right arrow || d
    if (e.keyCode == 39 || e.keyCode == 68)
      self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX*3,self.context.windowCenterY, true); 
    //down arrow || s
    if (e.keyCode == 40 || e.keyCode == 83)
      self.context.spaceViewController.scroller.scrollToMousePosition(self.context.windowCenterX,self.context.windowCenterY*3, true);
    if (keymap[e.keyCode]) {
      return ;
    }
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