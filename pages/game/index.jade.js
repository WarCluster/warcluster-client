var boot = require("../../client/boot");
var AppRouter = require("../../client/AppRouter");

  

$(document).ready(function() {
  // USERVOICE widget
  (function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/ZD3yBKaqsWuw05GqkIQmyQ.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})()
  UserVoice = window.UserVoice || [];
  UserVoice.push(['showTab', 'classic_widget', {
    mode: 'full',
    primary_color: '#0496ff',
    link_color: '#0496ff',
    default_mode: 'feedback',
    forum_id: 214551,
    tab_label: 'Feedback & Support',
    tab_color: '#0496ff',
    tab_position: 'top-right',
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



  



  /*var renderer  = new THREE.WebGLRenderer({
    antialias : true
  });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  //renderer.shadowMapEnabled = true
  
  var onRenderFcts= [];
  var scene = new THREE.Scene();
  var camera  = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100000000 );
  camera.position.z = 1;

  var light = new THREE.AmbientLight( 0x222222 )
  scene.add( light )


  container = new THREE.Object3D();
  scene.add(container);

  for (var i = 0;i < 200;i ++) {
    var containerEarth  = new THREE.Object3D()
    container.add(containerEarth)

    containerEarth.position.x = Math.random() * 150 - 75;
    containerEarth.position.y = Math.random() * 150 - 75;
    containerEarth.position.z = Math.random() * 150 - 75;


    var bmd1 = THREE.ImageUtils.loadTexture("/images/planets/planet0.png"); //context.resourcesLoader.get("/images/planets/planet0.png");
    var earthMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshPhongMaterial({ map: null, bumpMap: null }));
    containerEarth.add(earthMesh)
    earthMesh.material.map = bmd1;
    earthMesh.material.bumpMap = bmd1;

    
    var geometry  = new THREE.SphereGeometry(0.5, 32, 32)
    var material  = THREEx.createAtmosphereMaterial()
    material.side = THREE.BackSide
    material.uniforms.glowColor.value.set(0x00b3ff)
    material.uniforms.coeficient.value  = 0.5
    material.uniforms.power.value   = 4.0
    var mesh  = new THREE.Mesh(geometry, material );
    mesh.scale.multiplyScalar(1.15);
    containerEarth.add( mesh );
  }

  var startRendering = function() {
    var render = function() {
      console.log("-render-")
      requestAnimationFrame(render);

      camera.position.z += 3;
      renderer.render(scene, camera);
    }
    render();
  }

  startRendering();


  /*var renderer  = new THREE.WebGLRenderer({
    antialias : true
  });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  //renderer.shadowMapEnabled = true
  
  var onRenderFcts= [];
  var scene = new THREE.Scene();
  var camera  = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.01, 100000000 );
  camera.position.z = 1;

  var light = new THREE.AmbientLight( 0x222222 )
  scene.add( light )

  container = new THREE.Object3D();
  scene.add(container);

  for (var i = 0;i < 200;i ++) {
    var containerEarth  = new THREE.Object3D()
    container.add(containerEarth)

    containerEarth.position.x = Math.random() * 50 - 25;
    containerEarth.position.y = Math.random() * 50 - 25;
    containerEarth.position.z = Math.random() * 50 - 25;


    var moonMesh  = THREEx.Planets.createMoon()
    moonMesh.position.set(0.5,0.5,0.5)
    moonMesh.scale.multiplyScalar(1/5)
    //moonMesh.receiveShadow  = true
    //moonMesh.castShadow = true
    containerEarth.add(moonMesh)

    var earthMesh = THREEx.Planets.createEarth()
    //earthMesh.receiveShadow = true
    //earthMesh.castShadow  = true
    containerEarth.add(earthMesh)
    
    var geometry  = new THREE.SphereGeometry(0.5, 32, 32)
    var material  = THREEx.createAtmosphereMaterial()
    material.side = THREE.BackSide
    material.uniforms.glowColor.value.set(0x00b3ff)
    material.uniforms.coeficient.value  = 0.5
    material.uniforms.power.value   = 4.0
    var mesh  = new THREE.Mesh(geometry, material );
    mesh.scale.multiplyScalar(1.15);
    containerEarth.add( mesh );
  }

  //////////////////////////////////////////////////////////////////////////////////
  //    Camera Controls             //
  //////////////////////////////////////////////////////////////////////////////////
  var mouse = {x : 0, y : 0}
  document.addEventListener('mousemove', function(event){
    mouse.x = (event.clientX / window.innerWidth ) - 0.5
    mouse.y = (event.clientY / window.innerHeight) - 0.5
  }, false)
  onRenderFcts.push(function(delta, now){
    //camera.position.x += (mouse.x*125 - camera.position.x) * (delta*3)
    camera.position.z += 0.5; //(mouse.y*125 - camera.position.y) * (delta*3)
    camera.lookAt( scene.position )
  })


  //////////////////////////////////////////////////////////////////////////////////
  //    render the scene            //
  //////////////////////////////////////////////////////////////////////////////////
  onRenderFcts.push(function(){
    renderer.render( scene, camera );   
  })
  
  //////////////////////////////////////////////////////////////////////////////////
  //    loop runner             //
  //////////////////////////////////////////////////////////////////////////////////
  var lastTimeMsec= null
  requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec  = nowMsec
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
      onRenderFct(deltaMsec/1000, nowMsec/1000)
    })
  })*/



});



