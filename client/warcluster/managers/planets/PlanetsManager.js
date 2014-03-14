module.exports = function(context){
  THREE.EventDispatcher.call(this);

  this.context = context;
  this.interval = null;

  this.t = 0;
  this.buildIndexes = [1 / 60000, 2 / 60000, 3 / 60000, 4 / 60000];
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.start = function() {
  if (!this.interval) {
    var self = this;
    this.t = (new Date()).getTime();
    this.interval = setInterval(function() {
      self.managePopulation();
    }, 500);  
  }
}

module.exports.prototype.stop = function() {
  if (!this.interval) {
    clearInterval(this.interval);
    this.interval = null;
  }
}

module.exports.prototype.managePlanetData = function(planets) {
  var updated = [];
  
  for (var id in planets) {
    var planet = this.context.objectsById[id];
    planets[id].id = id;

    if (!planet) {
      planet = this.context.planetsFactory.build(planets[id]);
    } else {
      if (planet.population)
        planet.population.visible = (planets[id].ShipCount !== -1);
      var updatePopulation = (planets[id].ShipCount !== -1); //|| planet.data.ShipCount !== planets[id].ShipCount); //&& (planet.data.Owner === this.context.playerData.Username || planet.data.Owner === "")
      var updateOwner = planet.data.Owner !== planets[id].Owner;
      var updateColor = planet.data.Color !== planets[id].Color;
      var currentOwner = planet.data.Owner;

      _.extend(planet.data, planets[id]);

      if (updatePopulation) {
        if (planet.data.Owner === this.context.playerData.Username)
          updated.push(planets[id]);
        planet.updatePopulationInfo();
      }

      if (updateOwner) {
        if (currentOwner === this.context.playerData.Username)
          this.context.spaceViewController.selection.deselectPlanet(planet);
        planet.updateOwnerInfo();
      }

      if (updateColor)
        planet.updateColor();
    }
  }

  if (updated.length > 0)
    this.dispatchEvent({
      type: "selectionDataUpdated", 
      updated: updated
    });  
}

module.exports.prototype.managePopulation = function() {
  var t = (new Date()).getTime();
  var time = t - this.t;
  var updated = [];
  var planetData = null;
  var shipCount = 0;
  this.t = t;

  var selection = this.context.spaceViewController.selection;
  
  for(var i = 0;i < this.context.planets.length;i ++) {
    if (this.context.planets[i].data.ShipCount === -1) continue;
    planetData = this.context.planets[i].data;
    shipCount = planetData.ShipCount;
    planetData.ShipCount += time * this.getBuildIndex(planetData);  
    
    if (parseInt(shipCount) != parseInt(planetData.ShipCount)) {
      this.context.objectsById[planetData.id].updatePopulationInfo();
      if (selection.getSelectedPlanetDataById(planetData.id))
        updated.push(planetData);
    }
  }

  for(var i = 0;i < selection.selectedPlanets.length;i ++) {
    planetData = selection.selectedPlanets[i];
    if (!this.context.objectsById[planetData.id]) {
      shipCount = planetData.ShipCount;
      planetData.ShipCount += time * this.getBuildIndex(planetData); 
      
      if (parseInt(shipCount) != parseInt(planetData.ShipCount))
        updated.push(planetData);
    }
  }

  if (updated.length > 0)
    this.dispatchEvent({
      type: "selectionDataUpdated", 
      updated: updated
    });
}

module.exports.prototype.getBuildIndex = function (planetData) {
  if(planetData.Owner === "")
    return 0;
  else if (planetData.Size <= 2)
    return this.buildIndexes[0];
  else if ((planetData.Size > 2) &&  (planetData.Size <= 5))
    return this.buildIndexes[1];
  else if ((planetData.Size > 5) &&  (planetData.Size <= 8))
    return this.buildIndexes[2];
  else if ((planetData.Size > 8) &&  (planetData.Size <= 10))
    return this.buildIndexes[3];

  return 0;
}