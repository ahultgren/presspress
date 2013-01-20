"use strict";
/*
 * presspress
 * 
 *
 * Copyright (c) 2013 Andreas Hultgren
 * Licensed under the MIT license.
 */

var 
// Dependencies
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    express = require('express'),
    passport = require('passport'),
    cachify = require('connect-cachify'),
    routes = require('./routes'),
    grunt = require('../grunt'),
// Vars
    app = express(),
    assets;

/**
 * Environmental configuration
 *
 * Set some environment specific settings such as
 * database uri and logging.
 */
app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('db-uri', 'mongodb://localhost/presspress-dev');
  app.set('isProd', false);
});

app.configure('production', function () {
  app.use(express.errorHandler());
  app.set('db-uri', 'mongodb://localhost/presspress-production');
  app.set('isProd', true);
});


/**
 * Configure cachify
 */
assets = {};
assets[grunt.minjs.dest] = grunt.js.src;
assets[grunt.css.dest] = grunt.css.src;

app.use(cachify.setup(assets, {
  root: path.join(__dirname, '..'),
  production: app.get('isProd')
}));


/**
 * Connect to database
 *
 * Opens a connection to mongodb and then registers
 * our models within mongoose.
 */
mongoose.connect(app.get('db-uri'), function () {
  require('./models');
});


/**
 * Configure passport strategies
 * 
 * Add strategies for authenticating user via passport
 */
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  mongoose.model('User').findById(id, done);
});


/**
 * Application configuration
 *
 * Set global application configurations.
 */
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use('/files', express.static(path.join(__dirname, 'public')));

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  cookie: { maxAge: 60000 * 60 * 24 * 7 }, // One week
  secret: 'k15SC7785782FfX367i12bV4qH6nbDI84bB6Ay2KiB8r7HMCLKus~ImSX1DLFj4E'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.methodOverride());
app.use(app.router);


/**
 * Routes
 */
app.get('/', routes.index);


module.exports = function() {
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port') + ' with ' + app.get('db-uri'));
  });
};

module.exports();
