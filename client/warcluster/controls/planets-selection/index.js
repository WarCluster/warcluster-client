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
  initialize: function(context) {
    this.context = context;
    this.selectedPlanets = [];
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  hoverSelectedPlanet: function(e) {
    var planetIndex = this.getPlanetIndex(e.currentTarget.attributes[0].nodeValue)
    this.context.spaceViewController.selection.selectedPlanets[planetIndex].showHoverSelection();
  },
  unhoverSelectedPlanet: function(e) {
    var planetIndex = this.getPlanetIndex(e.currentTarget.attributes[0].nodeValue)
    this.context.spaceViewController.selection.selectedPlanets[planetIndex].hideHoverSelection();
  },
  getPlanetIndex: function(planetId) {
    var i , len = this.context.spaceViewController.selection.selectedPlanets.length;
    var temp = this.context.spaceViewController.selection.selectedPlanets;
    var planetIndex;
    for (i = 0; i < len; i++) {
      if (planetId === temp[i].data.id) {
        return planetIndex = i;
      }
    }
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

    this.$el.hide();
    this.$(".expanded-list-container").addClass("hide");
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
  moveCameraToPlanet: function(e) {
    var x = e.currentTarget.attributes[1].nodeValue.split(".")[1].split("_")[0];
    var y = e.currentTarget.attributes[1].nodeValue.split(".")[1].split("_")[1];
    this.context.spaceScene.moveTo(x, y);
  }
})
