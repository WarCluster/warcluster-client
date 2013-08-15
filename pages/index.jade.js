var boot = require("../client/boot");


$(document).ready(function() {
  $('.login').click( function() {
    var key = prompt("The alpha server is closed! You can go to http://signup.warcluster.com if you want to know when we open our doors ;P Thanks","closed alpha password");
      if (key === "alphawar") {
        $(".login").attr("href", "/twitter/connect");
      } else {
        $(".login").attr("href", "#");
      }
  });

  //Google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-42427250-1', 'warcluster.com');
  ga('send', 'pageview');
  //end of Google analytics tracking
  if (!window.WebGLRenderingContext) {
    // the browser doesn't even know what WebGL is
    window.location = "http://get.webgl.org";
  } else {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!ctx) {
      // browser supports WebGL but initialization failed.
      window.location = "http://get.webgl.org/troubleshooting";
    }
  console.log('webgl-success');
  }

});
