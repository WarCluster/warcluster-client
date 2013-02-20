Rectangle.prototype.intersects = function(r) {
	return this.x <= (r.x + r.width) && r.x <= (this.x + this.width) && this.y <= (r.y + r.height) && r.y <= (this.y + this.height);
}