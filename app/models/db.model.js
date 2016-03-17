/*
  DB model
  ==================

  Returns an authenticated, ready-to-use connection
  to the database server.

*/

module.exports = function(){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host: 'mysql.josetinoco.com',
    user: 'titfortat',
    password: '123qweasdzxc',
    database: 'titfortat'
  });

  connection.connect(function(err) {
    if (err) {
      console.error('DB: error connecting - ' + err.stack);
      throw err;
    } else {
      console.log('> DB connection opened, thread ID: ' + connection.threadId);
    }
  });

  return connection;
};
