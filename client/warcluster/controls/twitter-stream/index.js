module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {},
  className: "twitter-chat",
  initialize: function() {    
  },
  render: function(clusterTeam) {
    this.$el.html(this.template({
      hashtag: clusterTeam
    }));
    return this;
  }
})
