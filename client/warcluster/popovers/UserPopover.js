module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "popover right show customPop",
  events: {
    "click .close-btn": "removePopover",
    "click .attack":    "attack",
    "click .spy":       "spy"
  },
  initialize: function() {
    this.playerData = null;
  },
  render: function(){
    var ownerAvatarURL = this.playerData && this.playerData.OwnerAvatarURL ? this.playerData.OwnerAvatarURL : "images/default_avatar.jpg"; 
    var owner = this.playerData && this.playerData.Owner ? "@" + this.playerData.Owner : "Neutral Planet"; 
    //TODO: fix production coef according to github wiki
    var production = this.playerData && this.playerData.Size ? this.playerData.Size : 0;

    this.$el.html(this.template({
     playerName:        owner,
     twitterAvatar:     ownerAvatarURL,
     planetProduction:  production
    }));

    this.delegateEvents();
    $(".ui-container").append(this.el);
    
    return this;
  },
  updateInfo: function() {

  },
  show: function(l, t, data) {
    this.playerData = data;
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
  },
  spy: function(e) {
    console.log("spy: " + e);
  }
})