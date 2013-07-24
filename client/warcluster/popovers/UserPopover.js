module.exports = Backbone.View.extend({
  template: jadeCompile(require("./UserPopover.jade")),
  className: "popover right show customPop",
  events: {
    "click .close-btn": "removePopover"
  },
  render: function(playerData){
    this.$el.html(this.template({
     playerName:    playerData.Owner,
     twitterAvatar: playerData.OwnerAvatarURL
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