var boot = require("../../client/boot");
var AppRouter = require("../../client/AppRouter");

$(document).ready(function() {
  // USERVOICE widget
  (function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/ZD3yBKaqsWuw05GqkIQmyQ.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})()
  UserVoice = window.UserVoice || [];
  UserVoice.push(['showTab', 'classic_widget', {
    mode: 'full',
    primary_color: '#f69666',
    link_color: '#f1485e',
    default_mode: 'feedback',
    forum_id: 214551,
    tab_label: 'Feedback & Support',
    tab_color: '#a9466f',
    tab_position: 'bottom-left',
    tab_inverted: false
  }]);
  // end of UserVoice widget
  // 
  //Google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-42427250-1', 'warcluster.com');
  ga('send', 'pageview');
  //end of Google analytics tracking

  router = new AppRouter();
  Backbone.history.start({trigger: true});
  //try to fix https://trello.com/c/Fxe0XPV2/333-upon-refresh-the-screen-is-black 
  router.navigate("battle-field", {trigger: true});
  //unfortunately I cannot reproduce it so I don't know if this is a fix :D
});



