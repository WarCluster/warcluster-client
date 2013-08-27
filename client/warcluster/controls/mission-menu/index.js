module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .unit": "switchType"
  },
  className: "missions-menu",
  initialize: function(options) {
    var self = this;
    this.currentType = 1;
    this.percentArray = {
      1: 5,
      2: 10,
      3: 20,
      4: 50,
      5: 100
    };
    this.typeArray = {
      "type1": 1,
      "type2": 2,
      "type3": 3,
      "type4": 4,
      "type5": 5
    };
    $(document).keydown(function(e){
      switch (e.keyCode) {
        case 49:
          self.switchType(1);
        break;
        case 50:
          self.switchType(2);
        break;
        case 51:
          self.switchType(3);
        break;
        case 52:
          self.switchType(4);
        break;
        case 53:
          self.switchType(5);
        break;
      }
    });
  },
  switchType: function(index) {
    this.$(".type" + this.currentType).hide();
    this.currentType = index.hasOwnProperty("currentTarget") ? this.typeArray[index.currentTarget.firstChild.className.split(" ")[1]] : index;
    this.$(".type" + this.currentType).show();
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  getCurrentType: function(){
    return  this.percentArray[this.currentType];
  }
})
