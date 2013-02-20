var Sun = require("../../suns/Sun");

module.exports = function(context){
  this.context = context;
  this.cache = [];
}

module.exports.prototype.build = function() {
  var sun = this.cache.length > 0 ? this.cache.shift() : null;

  if (!sun)
    sun = new Sun(this.context);

  this.context.container.add(sun);
  
  return sun;
}

module.exports.prototype.destroy = function(sun) {
  this.context.container.remove(sun);
  this.cache.push(sun);

  return sun;
}