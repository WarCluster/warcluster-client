//TODO: implement an algorithm that will garbage collect useless objects 
//1.considering their timestamp creation first
//2.taking in account if the old objects are not in the visible area
//3.return a new array with indices for the objects that needs to be destroyed 
self.addEventListener('message', function(e) {
  var data = e.data;
  var scrollPosition = e.data[e.data.length - 1];
  var scaleIndex = e.data[e.data.length - 2];
  // for (var i = 0; i < Things.length - 2; i++) {
  // 	Things[i]
  // };
  console.log(scaleIndex);


  self.postMessage(e.data);
}, false);