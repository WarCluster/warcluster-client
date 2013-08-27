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
    this.loader = new THREE.JSONLoader();
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.loadTexture = function(path) {
    this.total ++;
    this.resources[path] = THREE.ImageUtils.loadTexture(path, null, this.onLoadComplete);
}

module.exports.prototype.loadModel = function(path, texturesPath) {
    var _self = this;

    this.total ++;
    this.loader.load(path, function(geometry, materials) {
        _self.resources[path] = {
            geometry: geometry, 
            materials: materials
        };
        
        _self.onLoadComplete();
    }, texturesPath);
}
 
module.exports.prototype.loadComplete = function(e) {
    this.totalLoaded ++;
    if (this.total == this.totalLoaded)
        this.dispatchEvent({type: "complete"});
}

module.exports.prototype.get = function(path) {
    return this.resources[path];
}