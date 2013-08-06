var boot = require("../client/boot");


$(document).ready(function() {
<<<<<<< HEAD
  console.log('before if');
=======

  //Google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-42427250-1', 'warcluster.com');
  ga('send', 'pageview');
  //end of Google analytics tracking

>>>>>>> develop
  if (!window.WebGLRenderingContext) {
    // the browser doesn't even know what WebGL is
    window.location = "http://get.webgl.org";
  } else {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl");
    if (!ctx) {
      // browser supports WebGL but initialization failed.
      window.location = "http://get.webgl.org/troubleshooting";
    }
  console.log('webgl-success');
  }
<<<<<<< HEAD
=======

>>>>>>> develop
});
