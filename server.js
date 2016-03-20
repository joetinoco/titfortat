/*

  Tit for Tat
  =======================================================

  COMP231 project - Winter 2016
  Instructor - Hao Lac

*/
console.log('> Loading global app config');
var config = require('./config/config');

console.log('> Starting up server');
var express = require('./config/express');
var app = express();

app.listen(process.env.PORT);
console.log('Server (' + process.env.NODE_ENV + ') is up, listening on port ' + process.env.PORT);
