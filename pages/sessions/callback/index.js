module.exports = function(config) {
  return {
    "GET": [
      function(req, res, next){
        res.sendPage();
      }
    ]
  }
}