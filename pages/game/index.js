module.exports = function(config) {
  return {
    "GET": [
      this.version,
      function(req, res, next) {
        if (!req.session.twitter)
          res.redirect("/");
        else
          next();
      },
      function(req, res, next){
        res.sendPage();
      }
    ]
  }
}