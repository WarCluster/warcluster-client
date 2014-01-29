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
  selectionChanged: function(e) {
    if (this.selectedPlanets.length == 0)
      this.show();

    if (e.deselectedPlanets)
      for (i = 0;i < e.deselectedPlanets.length;i ++)
        this.removePlanet(e.deselectedPlanets[i])

    if (e.selectedPlanets)
      for (var i = 0;i < e.selectedPlanets.length;i ++)
        this.addPlanet(e.selectedPlanets[i])

    if (this.selectedPlanets.length == 0) {
      this.hide();
    }
  },
  addPlanet: function(planetData) {
    this.$(".expanded-list").append(Render({model: planetData}));

    this.selectedPlanets.push(planetData);
    this.updateTotalPopulation();
  },
  removePlanet: function(planetData) {
    var index = this.getPlanetIndex(planetData);

    if (index != -1) {
      this.$('.selection-planet-item[data-id="'+planetData.id+'"]').remove();

      this.selectedPlanets.splice(index, 1);
      this.updateTotalPopulation();
    }
  },
  show: function() {
      TweenLite.to(this.$el, 0.3, {
        css:  {left: "0px"},
        ease: Cubic.easeOut
      });
  },
  hide: function() {
    TweenLite.to(this.$el, 0.3, {
      css:  {left: "-250px"},
      ease: Cubic.easeOut
    });
  },
  deselectAllPlanets: function() {
    this.selectedPlanets = [];
    this.$(".expanded-list").html("");
    this.hide();
  },
  executeDeselectPlanet: function(e) {
    this.trigger("deselectPlanet", $(e.currentTarget).attr("data-id"));
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
    for (var i = 0;i < updated.length;i ++)
      this.$('[data-id="'+updated[i].id+'"]').find(".shipCount").html(parseInt(updated[i].ShipCount));
    this.updateTotalPopulation();
  },
  updateTotalPopulation: function() {
    var total = 0;
    for (var i = 0;i < this.selectedPlanets.length;i ++)
      total += parseInt(this.selectedPlanets[i].ShipCount);
    this.$(".total-pilots").html("(" + total + " pilots)");
    this.$(".selected-planets").html(this.selectedPlanets.length);
  },
  moveCameraToPlanet: function(e) {
    this.trigger("scrollToPlanet", $(e.currentTarget).parent().attr("data-id"));
  },
  getPlanetIndex: function(data) {
    var id = data.id || data
    for (var i = 0;i < this.selectedPlanets.length;i ++)
      if (this.selectedPlanets[i].id == id)
        return i;
    return -1;
  },
  hasPlanets: function() {
    return this.selectedPlanets.length != 0;
  }
})
