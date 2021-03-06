// #!/usr/bin/env node
var util = require("util");
var Cell = require("organic").Cell;
var DNA = require("organic").DNA;

process.env.CELL_MODE = process.env.NODE_ENV || process.env.CELL_MODE || "development";

module.exports = function(callback) {
  
  var self = this;
  var bootApp = function(){
    Cell.call(self, dna);
    self.plasma.emit({type: "build", branch: "membrane"});
    self.plasma.emit({type: "build", branch: "plasma"});
    self.plasma.once("ExpressHttpActions", function(c){
      console.log(("api running in CELL_MODE == "+process.env.CELL_MODE).blue);
      if(callback) callback();
    });
  }

  var dna = new DNA();
  dna.loadDir(process.cwd()+"/dna", function(){
    if(dna[process.env.CELL_MODE])
      dna.mergeBranchInRoot(process.env.CELL_MODE);
    
    bootApp();
  });
}

util.inherits(module.exports, Cell);

module.exports.prototype.kill = function(){
  this.plasma.emit("kill");
}

// start the cell if this file is not required
if(!module.parent)
  new module.exports();