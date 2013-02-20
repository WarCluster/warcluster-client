module.exports = function(){
	THREE.EventDispatcher.call(this);
	var _self = this;

  	this.resourcesForLoad = [];
    this.resources = [];

    this.onLoadComplete = function(e) {
        _self.loadComplete(e);
    }

    this.total = 0;
    this.totalLoaded = 0;
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.loadTexture = function(path) {
    this.total ++;
    this.resources[path] = THREE.ImageUtils.loadTexture(path, null, this.onLoadComplete);
}

module.exports.prototype.loadComplete = function(e) {
    this.totalLoaded ++;

    //console.log("loadComplete:", e, this.total, this.totalLoaded);

    if (this.total == this.totalLoaded)
        this.dispatchEvent({type: "complete"});
}

module.exports.prototype.get = function(path) {
    return this.resources[path];
}