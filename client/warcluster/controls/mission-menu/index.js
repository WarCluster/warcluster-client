module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .unit": "onSwitchType"
  },
  className: "missions-menu",
  initialize: function(options) {
    var self = this;
    this.context = options.context;
    this.currentType = 1;
    this.percentArray = {
      1: 5,
      2: 10,
      3: 20,
      4: 50,
      5: 100
    };
  },
  onSwitchType: function(e) {
    var index = parseFloat($(e.currentTarget).attr("data-index"));
    this.switchType(index);
  },
  switchType: function(index) {
    this.$("#type" + this.currentType).addClass("hide");
    this.currentType = index;
    this.$("#type" + this.currentType).removeClass("hide");
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  getCurrentType: function(){
    return  this.percentArray[this.currentType];
  },
  showMenu: function(){
    if (this.context.planets.length != 0) {
      TweenLite.to(this.$el, 0.3, {
        css:  {top: "0px"},
        ease: Cubic.easeOut
      });
    }
  },
  //the planetName argument is there for a reason
  hideMenu: function(planetName){
    if (planetName === undefined) {
      TweenLite.to(this.$el, 0.3, {
        css:  {top: "-141px"},
        ease: Cubic.easeOut
      });
    }
    else if (this.context.planets.length < 1) {
      TweenLite.to(this.$el, 0.3, {
        css:  {top: "-141px"},
        ease: Cubic.easeOut
      });
    }
  }
})
