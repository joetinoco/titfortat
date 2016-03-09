/*
  "index" controller
  ==================

  Serves the home page

*/

// Just a placeholder for the index page
exports.render = function(req, res){
  if(!req.user){
    res.send('You are not logged in.<br/><a href="/signin">Log in</a> or <a href="/signup">sign up</a>');
  } else {
    var db = require('../models/db.model')();

    db.query('SHOW TABLES;', function(err, rows, fields) {
      if (err) throw err;
      var content = 'Hello, ' + req.user.userName + '<br/><hr>DB tables: <br/>';
      var colHeader = Object.keys(rows[0])[0];
      for (var i=0; i < rows.length; i++){
        content += rows[i][colHeader] + '<br/>';
      }
      db.end();
      res.send(content);
    });
  }

};
