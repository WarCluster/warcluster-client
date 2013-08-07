module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "popover right show customPop",
  events: {
    "click .close-btn": "removePopover",
    "click .attack":    "attack",
    "click .spy":       "spy"
  },
  render: function(playerData){
    var ownerAvatarURL = playerData && playerData.OwnerAvatarURL ? playerData.OwnerAvatarURL : "images/default_avatar.jpg"; 
    var owner = playerData && playerData.Owner ? "@" + playerData.Owner : "Neutral Planet"; 
    //TODO: fix production coef according to github wiki
    var production = playerData && playerData.Size ? playerData.Size : 0;

    this.$el.html(this.template({
     playerName:        owner,
     twitterAvatar:     ownerAvatarURL,
     planetProduction:  production
    }));
    this.delegateEvents();
    $(".ui-container").append(this.el);
    $(this.el).css({position: "absolute", "margin-top": -$(this.el).height()/2});
    return this;
  },
  move: function(l, t) {
    $(this.el).css({ top: t, left: l+10});
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