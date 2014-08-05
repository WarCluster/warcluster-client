module.exports = function(){
  this.$content = null;
  
  this.areaSize = 5000;
  this.container = null;
  this.planetsHitObjects = [];
  this.objectsById = {};
  this.objects = [];
  this.planets = [];
  this.missions = [];
  this.suns = [];
  this.interactiveObjects = [];

  this.width = 0;
  this.height = 0;

  this.Races = {};

  this.currentTime = 0;
  this.processingTime = 0;
}