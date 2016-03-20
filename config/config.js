// Set global environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

// Configure Passport
require('./passportconfig.js')();

// Get configuration file for the execution environment
module.exports = require('./env/' + process.env.NODE_ENV + '.js');
