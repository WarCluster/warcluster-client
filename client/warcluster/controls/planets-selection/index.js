var Render = jadeCompile(require("./render/index.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .collapsed-list":            "togglePlanets",
    "click .deselect-planet":           "executeDeselectPlanet",
    "click .planet-link":               "moveCameraToPlanet",
    "mouseover .selection-planet-item": "hoverSelectedPlanet",
    "mouseout .selection-planet-item":  "unhoverSelectedPlanet"
  },
  className: "planets-selection",
  initialize: function(options) {
    this.context = options.context;
    this.selectedPlanets = [];
    this.allPilotsSelected = 0;
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  hoverSelectedPlanet: function(e) {
    this.trigger("planetOver", $(e.currentTarget).attr("data-id"));
  },
  unhoverSelectedPlanet: function(e) {
    this.trigger("planetOut", $(e.currentTarget).attr("data-id"));
  },
  selectPlanet: function(planetData) {
    if (this.selectedPlanets.length == 0){
      this.showPlanetsSelection();
    }

    if (!(this.selectedPlanets.indexOf(planetData) > -1)) {
      this.allPilotsSelected += Math.floor(planetData.ShipCount);
      this.selectedPlanets.push(planetData);
      this.updateSelectedPlanets();
        
      this.$(".expanded-list").append(Render({model: planetData}));
    }
  },
  showPlanetsSelection: function() {
      TweenLite.to(this.$el, 0.3, {
        css:  {left: "0px"},
        ease: Cubic.easeOut
      });
  },
  hidePlanetsSelection: function() {
    TweenLite.to(this.$el, 0.3, {
      css:  {left: "-250px"},
      ease: Cubic.easeOut
    });
  },
  deselectPlanet: function(planetData) {
    var index = this.getPlanetIndex(planetData);

    if (index != -1) {
      this.allPilotsSelected -= Math.floor(this.selectedPlanets[index].ShipCount);
      this.selectedPlanets.splice(index, 1);
      this.updateSelectedPlanets();

      this.$('.selection-planet-item[data-id="'+planetData.id+'"]').remove();

      if (this.selectedPlanets.length == 0) {
        this.context.missionsMenu.hideMenu();
        this.hidePlanetsSelection();
        this.$(".expanded-list-container").addClass("hide");
      }
    }
  },
  deselectAllPlanets: function() {
    this.selectedPlanets = [];
    this.allPilotsSelected = 0;

    this.$(".expanded-list").html("");
    this.hidePlanetsSelection();

    this.updateSelectedPlanets();
  },
  executeDeselectPlanet: function(e) {
    this.trigger("deselectPlanet", $(e.currentTarget).attr("data-id"));
  },
  updateSelectedPlanets: function() {
    this.$(".selected-planets").html(this.selectedPlanets.length);
    this.$(".total-pilots").html("(" + this.allPilotsSelected + " pilots)");
  },
  togglePlanets: function() {
    if (this.expanded()) {
      this.$(".collapsed-icon").hide();
      this.$(".expanded-icon").show();

      this.$(".expanded-list-container").removeClass("hide");
    } else {
      this.$(".collapsed-icon").show();
      this.$(".expanded-icon").hide();

      this.$(".expanded-list-container").addClass("hide");
    }
  },
  expanded: function() {
    return this.$(".expanded-list-container").hasClass("hide");
  },
  updatePopulations: function(updated) {
    var lastShipCount;
    for (var i = 0;i < updated.length;i ++) {
      lastShipCount = parseInt(this.$('[data-id="'+updated[i].id+'"]').find(".shipCount").html()) || -1;
      if (lastShipCount === -1) {
        continue;
      }
      this.allPilotsSelected += Math.round(updated[i].ShipCount - lastShipCount);
      this.$('[data-id="'+updated[i].id+'"]').find(".shipCount").html(parseInt(updated[i].ShipCount));
    }
    this.$(".total-pilots").html("(" + this.allPilotsSelected + " pilots)");    
  },
  moveCameraToPlanet: function(e) {
    this.trigger("scrollToPlanet", $(e.currentTarget).parent().attr("data-id"));
  },
  getPlanetIndex: function(planetData) {
    for (var i = 0;i < this.selectedPlanets.length;i ++)
      if (this.selectedPlanets[i].id == planetData.id)
        return i;
    return -1;
  }
})
