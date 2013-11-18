module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .unit": "onSwitchType"
  },
  className: "missions-menu hide",
  initialize: function(options) {
    var self = this;
    this.currentType = 1;
    this.percentArray = {
      1: 5,
      2: 10,
      3: 20,
      4: 50,
      5: 100
    };
    this.selectedPlanetsCount = 0;

    $(document).keydown(function(e){
      if (e.keyCode > 48 && e.keyCode < 54)
        self.switchType(e.keyCode - 48);
    });
  },
  onSwitchType: function(e) {
    var index = parseFloat($(e.currentTarget).attr("data-index"));
    this.switchType(index);
  },
  switchType: function(index) {
    this.$(".type" + this.currentType).hide();
    this.currentType = index;
    this.$(".type" + this.currentType).show();
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  getCurrentType: function(){
    return  this.percentArray[this.currentType];
  },
  showMenu: function(){
    if (this.selectedPlanetsCount > 0) 
      this.$el.show("fast");
    this.selectedPlanetsCount += 1;
  },
  hideMenu: function(planetName){
    if (planetName === undefined) {
      this.$el.hide("fast");
      this.selectedPlanetsCount = 0;
    }
    else {
      this.selectedPlanetsCount -= 1;
      if (this.selectedPlanetsCount < 1) {
        this.$el.hide("fast");
      }
    }
  }
})
