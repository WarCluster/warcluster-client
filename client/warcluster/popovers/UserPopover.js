module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "planet-info-popover",
  events: {
    "click .close-btn": "removePopover",
    "click .attack":    "attack",
    "click .spy":       "spy",
    "click .supply":    "supply",
    "touchstart .close-btn": "removePopover",
    "touchstart .attack":    "attack",
    "touchstart .spy":       "spy",
    "touchstart .supply":    "supply",
    "touchstart .player-name": "navigateToTwitterProfile"
  },
  initialize: function(context) {
    this.planetData = null;
    this.context = context;
  },
  render: function(){
    var planetCategory = this.planetData.IsHome ? "Home Planet: " : "Planet Name: ";
    var screenName = this.planetData && this.planetData.Owner ? this.planetData.Owner.split("player.").join("") : null;
    var planetName = this.planetData.Name;
    var twitterAvatar = screenName ? "http://avatars.io/twitter/"+screenName+"?size=large" : "/images/default_avatar.png";
    var owner = screenName ? "@" + screenName : "Neutral Planet";

    var productionPerMinute;
    var serverParams = this.context.serverParams;

    if (this.planetData.ShipCount > this.planetData.MaxShipCount) {
      productionPerMinute = -(serverParams.PlanetsSPM[this.planetData.Size]*serverParams.ShipsDeathModifier);
    } else if (this.planetData.ShipCount == this.planetData.MaxShipCount) {
      productionPerMinute = 0;
    } else if (this.planetData.IsHome) {
      productionPerMinute = this.context.serverParams.HomeSPM;
    } else {
      productionPerMinute = this.context.serverParams.PlanetsSPM[this.planetData.Size]
    }

    this.$el.html(this.template({
     playerName:        owner,
     twitterAvatar:     twitterAvatar,
     planetProduction:  parseInt(productionPerMinute),
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
    // console.log("attack: " + e);
    this.trigger("attack", this.planetData.id);
  },
  spy: function(e) {
    // console.log("spy: " + e);
    this.trigger("spy", this.planetData.id);
  },
  supply: function(e) {
    this.trigger("supply", this.planetData.id);
  },
  navigateToTwitterProfile: function (e) {
    window.open(e.target.href)
  }
})