module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .twitter-stream-toggle-btn": "toggleTwitterStream"
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
    if (this.expanded()) {
      this.$(".visible-twitter-stream").removeClass("hide");
      this.$(".invisible-twitter-stream").addClass("hide");
      this.showTwitterStream();
    } else {
      this.$(".visible-twitter-stream").addClass("hide");
      this.$(".invisible-twitter-stream").removeClass("hide");
      this.hideTwitterStream();
    }
  },
  expanded: function() {
    return this.$(".visible-twitter-stream").hasClass("hide");
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
