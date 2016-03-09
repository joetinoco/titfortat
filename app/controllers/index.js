/*
  "index" controller
  ==================

  Serves the home page

*/

exports.render = function(req, res){
  var db = require('../models/dbconn')();

  db.query('SHOW TABLES;', function(err, rows, fields) {
    if (err) throw err;
    var content = 'Hello, world<br/><hr>DB tables: <br/>';
    var colHeader = Object.keys(rows[0])[0];
    for (var i=0; i < rows.length; i++){
      content += rows[i][colHeader] + '<br/>';
    }
    db.end();
    res.send(content);
  });

};
