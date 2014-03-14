var Sun = require("../../space/suns/Sun");

module.exports = function(context){
  this.context = context;
  this.cache = [];
}

module.exports.prototype.build = function(sunData) {
  var sun = this.cache.length > 0 ? this.cache.shift() : null;

  if (!sun)
    sun = new Sun(this.context);

  this.context.container.add(sun);
  sun.prepare(sunData)

  this.context.objects.push(sun);
  this.context.objectsById[sunData.id] = sun;
  
  return sun;
}

module.exports.prototype.destroy = function(sun) {
  this.context.container.remove(sun);

  delete this.context.objectsById[sun.data.id];
  this.context.objects.splice(this.context.objects.indexOf(sun), 1);
  
  this.cache.push(sun);

  return sun;
}