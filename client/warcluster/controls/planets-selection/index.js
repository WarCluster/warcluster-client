var Render = jadeCompile(require("./render/index.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .collapsed-list": "togglePlanets"
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

      if (this.selectedPlanets.length == 0)
        this.$el.hide();
    }
  },
  deselectAllPlanets: function() {
    this.selectedPlanets = [];
    this.$(".expanded-list").html("");
    this.updateSelection();

    this.$el.hide();
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
  }
})
