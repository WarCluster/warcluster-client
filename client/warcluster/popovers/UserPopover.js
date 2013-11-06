module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "popover right show customPop",
  events: {
    "click .close-btn": "removePopover",
    "click .attack":    "attack",
    "click .spy":       "spy"
  },
  initialize: function() {
    this.planetData = null;
  },
  render: function(){
    var planetCategory = this.planetData.IsHome ? "Home Planet: " : "Planet Name: ";
    var screenName = this.planetData && this.planetData.Owner ? this.planetData.Owner.split("player.").join("") : null;
    var planetName = "PlanetName";//this.planetData.PlanetName
    var twitterAvatar = screenName ? "https://twitter.com/api/users/profile_image/"+screenName+"?size=bigger" : "/images/default_avatar.jpg";
    var owner = screenName ? "@" + screenName : "Neutral Planet"; 
    var production = this.planetData && this.planetData.Size ? this.planetData.Size : 0;

    this.$el.html(this.template({
     playerName:        owner,
     twitterAvatar:     twitterAvatar,
     planetProduction:  production,
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
    t -= this.$el.height()/2 + 2;
    this.$el.css({ top: t, left: l + 5});
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
  }
})