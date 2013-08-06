var Sun = require("../../suns/Sun");

module.exports = function(context){
  this.context = context;
  this.cache = [];
}

module.exports.prototype.build = function(data) {
  var sun = this.cache.length > 0 ? this.cache.shift() : null;

  if (!sun)
    sun = new Sun(this.context, data);

  this.context.container.add(sun);
  this.context.objects.push(sun);
  
  return sun;
}

module.exports.prototype.destroy = function(sun) {
  this.context.container.remove(sun);
  this.context.objects.splice(this.context.objects.indexOf(sun), 1);
  
  this.cache.push(sun);

  return sun;
}