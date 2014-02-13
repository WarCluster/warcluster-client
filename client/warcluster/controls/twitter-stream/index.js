module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .toggle-btn": "toggleTwitterStream"
  },
  className: "twitter-stream",
  initialize: function() {    
  },
  render: function(clusterTeam) {
    this.$el.html(this.template({
      hashtag: clusterTeam
    }));
    return this;
  },
  toggleTwitterStream: function() {
    if (!this.expanded()) {
      this.$(".icon-play").addClass("icon-white");
      this.showTwitterStream();
    } else {
      this.$(".icon-play").removeClass("icon-white");
      this.hideTwitterStream();
    }
  },
  expanded: function() {
    return this.$(".icon-play").hasClass("icon-white");
  },
  showTwitterStream: function() {
      TweenLite.to(this.$el, 0.3, {
        css:  {right: "0px"},
        ease: Cubic.easeOut
      });
  },
  hideTwitterStream: function() {
    TweenLite.to(this.$el, 0.3, {
      css:  {right: "-246px"},
      ease: Cubic.easeOut
    });
  }
})
