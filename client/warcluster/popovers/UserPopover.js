module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "planet-info-popover",
  events: {
    "click .close-btn": "removePopover",
    "click .attack":    "attack",
    "click .spy":       "spy",
    "click .supply":    "supply"
  },
  initialize: function() {
    this.planetData = null;
  },
  render: function(){
    var planetCategory = this.planetData.IsHome ? "Home Planet: " : "Planet Name: ";
    var screenName = this.planetData && this.planetData.Owner ? this.planetData.Owner.split("player.").join("") : null;
    var planetName = this.planetData.Name;
    var twitterAvatar = screenName ? "https://twitter.com/api/users/profile_image/"+screenName+"?size=bigger" : "/images/default_avatar.png";
    var owner = screenName ? "@" + screenName : "Neutral Planet"; 
    var production = this.planetData && this.planetData.Size ? this.planetData.Size : 0;
    var ceilProduction = Math.ceil(production/3);
    var productionPerMinute = (ceilProduction > 3) ? 3 : ceilProduction;

    this.$el.html(this.template({
     playerName:        owner,
     twitterAvatar:     twitterAvatar,
     planetProduction:  productionPerMinute,
     planetLink:        planetName,
     planetCategory:    planetCategory
    }));

    this.delegateEvents();
    $(".ui-container").append(this.el);
    
    return this;
  },
  updateInfo: function() {

  },
  show: function(l, t, data) {
    this.planetData = data;
    this.render();
    this.move(l, t);
  },
  move: function(l, t) {
    this.$el.css({ top: t-120, left: l-161.5});
  },
  removePopover: function(e) {
    e.preventDefault();
    this.remove();
  },
  attack: function(e) {
    console.log("attack: " + e);
    this.trigger("attack", this.planetData.id);
  },
  spy: function(e) {
    console.log("spy: " + e);
    this.trigger("spy", this.planetData.id);
  },
  supply: function(e) {
    this.trigger("supply", this.planetData.id);
  }
})