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
  initialize: function() {
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
    if (this.selectedPlanets.length == 0)
      this.$el.show();

    this.selectedPlanets.push(planetData);
    this.updateSelection();

    this.$(".expanded-list").append(Render({model: planetData}));
  },
  deselectPlanet: function(planetData) {
    var index = this.selectedPlanets.indexOf(planetData);
    if (index != -1) {
      this.selectedPlanets.splice(index, 1);
      this.updateSelection();

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
    this.updateSelection();

    /*this.$el.hide();
    this.$(".expanded-list-container").addClass("hide");*/
  },
  executeDeselectPlanet: function(e) {
    this.trigger("deselectPlanet", $(e.currentTarget).attr("data-id"));
  },
  updateSelection: function() {
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
  moveCameraToPlanet: function(e) {
    this.trigger("scrollToPlanet", $(e.currentTarget).attr("data-id"));
  }
})
