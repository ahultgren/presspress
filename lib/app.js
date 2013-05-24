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
    passport = require('passport'),
    _ = require('underscore'),
// Internal modules
    controllers = require('./controllers'),
// Vars
    basePath = path.dirname(require.main.filename);


/**
 * Export stuff
 */

module.exports = exports = function (settings) {
  var app = express();
  settings = settings || {};

  // Init hooks
  controllers(app);


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

  app.set('views', __dirname);
  app.engine('jade', engines.jade);
  app.engine('dot', engines.dot);


  /**
   * Configure middlewares
   */

  app.use(controllers.render);
  app.use(express.favicon());
  app.use(controllers.public.static);

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    cookie: { maxAge: 60000 * 60 * 24 * 7 }, // One week
    secret: settings.cookieSecret
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.methodOverride());
  app.use(controllers.route.middleware);

  _.extend(app, controllers.app);

  exports.app = app; //## Is this good or bad practice?
  return app;
};

exports.express = express;
exports.mongoose = mongoose;
exports.controllers = controllers;
exports.utils = require('./utils');
exports.basePath = basePath;
