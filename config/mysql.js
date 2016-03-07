module.exports = function(){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host: 'mysql.josetinoco.com',
    user: 'titfortat',
    password: '123qweasdzxc'
  });

  connection.connect(function(err) {
    if (err) {
      console.error('DB: error connecting - ' + err.stack);
      return;
    } else {
      console.log('> Connected to DB server successfully.');
    }
  });
};
