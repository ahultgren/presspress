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
    engines = require('consolidate'),
    app = express(),
    passport = require('passport'),
    cachify = require('connect-cachify'),
    grunt = require('../grunt'),
// Internal modules
    routes = require('./routes'),
    controllers = require('./controllers')(app),
// Vars
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
passport.use(controllers.auth.LocalStrategy());
passport.serializeUser(controllers.auth.serialize);
passport.deserializeUser(controllers.auth.deserialize);


/**
 * Application configuration
 *
 * Configure application setings
 */
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname);
app.engine('jade', engines.jade);
app.engine('dot', engines.dot);

// Temporary settings for a site/theme structure
app.set('theme.name', 'Default theme');
app.set('theme.folder', 'default');


/**
 * Configure middlewares
 */
app.use(express.favicon());
app.use('/files', express['static'](path.join(__dirname, 'public')));

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
app.use(controllers.render);
app.use(controllers.route.middleware);


/**
 * Routes
 */
//app.all('*', controllers.route);

module.exports = function() {
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port') + ' with ' + app.get('db-uri'));
  });
};

module.exports();
