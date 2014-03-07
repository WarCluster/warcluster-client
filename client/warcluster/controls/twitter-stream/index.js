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
    debugger;
    if (this.expanded()) {
      this.$(".icon-circle-arrow-right").removeClass("hide");
      this.$(".icon-circle-arrow-left").addClass("hide");
      this.showTwitterStream();
    } else {
      this.$(".icon-circle-arrow-right").addClass("hide");
      this.$(".icon-circle-arrow-left").removeClass("hide");
      this.hideTwitterStream();
    }
  },
  expanded: function() {
    return this.$(".icon-circle-arrow-right").hasClass("hide");
  },
  showTwitterStream: function() {
      TweenLite.to(this.$el, 0.3, {
        css:  {right: "0px"},
        ease: Cubic.easeOut
      });
  },
  hideTwitterStream: function() {
    TweenLite.to(this.$el, 0.3, {
      css:  {right: "-240px"},
      ease: Cubic.easeOut
    });
  }
})
