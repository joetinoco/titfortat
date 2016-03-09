/*

  Express application startup
  ===========================

*/
module.exports = function(){
  var express = require('express'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    flash = require('connect-flash');

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

  // Set template engine (EJS)
  app.set('views', './app/views');
  app.set('view engine', 'ejs');
  if(process.env.NODE_ENV === 'development'){
    app.set('view cache', false);
    app.disable('etag'); // Prevent 304 (not modified) responses
  }

  // Set "flash messages" (connect-flash)
  app.use(session({
    secret: 'do not tell anyone',
    resave: true,
    saveUninitialized: true
  }));
  app.use(flash());

  // Set passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Set routes
  require('../app/routes/server.routes.js')(app);
  return app;
}
