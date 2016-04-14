/*
  DB model
  ==================

  Returns an authenticated, ready-to-use connection
  to the database server.

*/

module.exports = function(){
  var mysql      = require('mysql');
  var connection = {};
  var configs = [
    {
      host: 'mysql.josetinoco.com',
      user: 'titfortat',
      password: '123qweasdzxc',
      database: 'titfortat'
    },
    {
      host: 'localhost', // SSH tunnel to circumvent Centennial's firewall
      port: 3307,
      user: 'titfortat',
      password: '123qweasdzxc',
      database: 'titfortat'
    }
  ];

  connection = mysql.createConnection(configs[0]);
  connection.connect(function(err) {
    if (err) {
      console.error('DB: error connecting to server ' + err.stack);
      throw err;
    }
  });

  return connection;
};
