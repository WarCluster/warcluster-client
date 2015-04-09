module.exports = function(config) {
  return {
    "GET": [
      this.version,
      function(req, res, next) {
        if (!req.session.twitter)
          res.redirect("/");
        else {
          res.sendPage();
        }
      },
      function(req, res, next){
        res.sendPage();
      }
    ]
  }
}