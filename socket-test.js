var io = require("socket.io-client");

var socket = io.connect('212.117.45.91:7000');
socket.on('connect', function () {
  console.log("-connect-");
  // socket connected
});
socket.on('custom event', function () {
  // server emitted a custom event
  console.log("-custom event-");
});
socket.on('disconnect', function () {
  // socket disconnected
  console.log("-disconnect-");
});
socket.on('error', function () {
  // socket disconnected
  console.log("-error-", arguments);
});
socket.send('hi there');

//console.log("-YES-", io);