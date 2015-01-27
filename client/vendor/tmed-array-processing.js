module.exports = function(particles, arr, fn, context, callback){
  var i = 0;
  var tick = function() {
    var start = new Date().getTime();
    for (; i < positions.length && (new Date().getTime()) - start < 50; i++) {
      fn.call(context, particles[i], positions[i]);
    }
    if (i < positions.length) {
      // Yield execution to rendering logic
      setTimeout(tick, 25);
    } else {
      callback(positions, particles);
    }
  };
  setTimeout(tick, 25);
}

module.exports.prototypr.addArrayrocessing = function(arr, process, context, maxTime) {
  var i = 0;
  var tick = function() {
    var start = new Date().getTime();
    for (; i < arr.length && (new Date().getTime()) - start < maxTime; i++) {
      fn.call(context, particles[i], arr[i]);
    }
    if (i < arr.length) {
      // Yield execution to rendering logic
      setTimeout(tick, 25);
    } else {
      callback(arr, particles);
    }
  };
  setTimeout(tick, 25);
}