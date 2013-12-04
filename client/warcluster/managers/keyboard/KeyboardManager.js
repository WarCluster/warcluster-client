module.exports = function(context){
  var self = this;
  this.context = context;
  $(document).keydown(function(e){
    if(e.keyCode === 32) {
      debugger;
    }
  });
  $(document).keyup(function(e){
    
  });
}
}