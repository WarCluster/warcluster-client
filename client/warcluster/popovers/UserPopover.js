module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "popover right show customPop",
  events: {
    "click .close-btn": "removePopover"
  },
  render: function(playerData){
    var ownerAvatarURL = (playerData.OwnerAvatarURL === "") ? "images/default_avatar.jpg" : playerData.OwnerAvatarURL; 
    var owner = (playerData.Owner === "") ? "Neutral Planet" : "@" + playerData.Owner; 
    this.$el.html(this.template({
     playerName:    owner,
     twitterAvatar: ownerAvatarURL
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
  }
})