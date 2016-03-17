/*
  "index" controller
  ==================

  Serves the home page

*/

// Just a placeholder for the index page
exports.render = function(req, res){
  res.render('index', { pageTitle: '', user: req.user } );
};
