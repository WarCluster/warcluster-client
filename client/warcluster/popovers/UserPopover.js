module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "popover right show customPop",
  events: {
    "click .close-btn": "removePopover"
  },
  render: function(playerData){
    // var playerAvatar = "http://a0.twimg.com/profile_images/1780216111/1ae72f5_normal.jpg";
    console.log("playerData.AvatarURL:" + playerData.AvatarURL);
    this.$el.html(this.template({
     playerName:    playerData.Owner,
     twitterAvatar: "http://a0.twimg.com/profile_images/1780216111/1ae72f5_normal.jpg"
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