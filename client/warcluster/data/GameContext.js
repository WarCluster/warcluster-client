module.exports = function(){
  this.$content = null;
  
  this.container = null;
  this.planetsHitObjects = [];
  this.objectsById = {};
  this.objects = [];
  this.planets = [];
  this.interactiveObjects = [];

  this.width = 0;
  this.height = 0;

  this.Teams = {};

  this.currentTime = 0;
  this.processingTime = 0;
}