var Sun = require("../../space/suns/Sun");

module.exports = function(context){
  this.context = context;
  this.cache = [];
}

module.exports.prototype.build = function(sunData) {
  var sun = this.cache.length > 0 ? this.cache.shift() : new Sun(this.context);
  sun.prepare(sunData)

  if (!sun.parent)
    this.context.container.add(sun);

  sun.visible = true;

  this.context.objects.push(sun);
  this.context.objectsById[sunData.id] = sun;

  this.context.suns.push(sun);
  
  return sun;
}

module.exports.prototype.destroy = function(sun) {
  sun.destroy();
  //this.context.container.remove(sun);
  sun.visible = false;

  delete this.context.objectsById[sun.data.id];
  this.context.objects.splice(this.context.objects.indexOf(sun), 1);
  this.context.suns.splice(this.context.suns.indexOf(sun), 1);
  
  this.cache.push(sun);

  return sun;
}