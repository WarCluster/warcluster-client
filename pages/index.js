module.exports = function(config) {
  return {
    "GET": [
      this.version,
      function(req, res, next){
        res.sendPage();
      }
    ]
  }
}