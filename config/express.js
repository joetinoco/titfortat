/*

  Express application startup
  ===========================

*/
module.exports = function(){
  var express = require('express'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser');

  var app = express();

  // Set execution environment dependent middleware
  if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); // Log every connection
  } else if (process.env.NODE_ENV === 'production'){
    app.use(compression()); // Compress output
  }

  // Set static files route
  app.use(express.static('public/'));

  // Set POST data parser
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // Set routes
  require('../app/routes/server.routes.js')(app);
  return app;
}
