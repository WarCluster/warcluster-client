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
  className: "planets-selection hide",
  initialize: function(options) {
    this.context = options.context;
    this.selectedPlanets = [];
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
    var self = this;
    if (this.selectedPlanets.length == 0)
      this.$el.show();

    this.selectedPlanets.push(planetData);
    this.updateSelectedPlanets();
      
    this.$(".expanded-list").append(Render({model: planetData}));
  },
  deselectPlanet: function(planetData) {
    var index = this.getPlanetIndex(planetData);

    if (index != -1) {
      this.selectedPlanets.splice(index, 1);
      this.updateSelectedPlanets();

      this.$('.selection-planet-item[data-id="'+planetData.id+'"]').remove();

      if (this.selectedPlanets.length == 0) {
        this.$el.hide();
        this.$(".expanded-list-container").addClass("hide");
      }
    }
  },
  deselectAllPlanets: function() {
    this.selectedPlanets = [];

    this.$(".expanded-list").html("");
    this.$el.hide();

    this.updateSelectedPlanets();
  },
  executeDeselectPlanet: function(e) {
    this.trigger("deselectPlanet", $(e.currentTarget).attr("data-id"));
  },
  updateSelectedPlanets: function() {
    this.$(".selected-planets").html(this.selectedPlanets.length);
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
  updatePilots: function(planetData) {
    this.$('.selection-planet-item[data-id="'+planetData.id+'"] .shipCount').html(planetData.ShipCount);
  },
  updatePopulations: function(updated) {
    for (var i = 0;i < updated.length;i ++)
      this.$('[data-id="'+updated[i].id+'"]').find(".shipCount").html(parseInt(updated[i].ShipCount));
  },
  moveCameraToPlanet: function(e) {
    this.trigger("scrollToPlanet", $(e.currentTarget).attr("data-id"));
  },
  getPlanetIndex: function(planetData) {
    for (var i = 0;i < this.selectedPlanets.length;i ++)
      if (this.selectedPlanets[i].id == planetData.id)
        return i;
  }
})
