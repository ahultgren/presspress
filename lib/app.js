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
    controllers = require('./controllers');


/**
 * Export stuff
 */

module.exports = exports = function (settings) {
  var app = require('connectr').patch(express());

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

  app.use(controllers.render).as('render hijacking');
  app.use(express.favicon()).as('favicon');
  app.use(controllers.public.static).as('static');

  app.use(express.logger('dev')).as('logger');
  app.use(express.bodyParser()).as('bodyParser');
  app.use(express.cookieParser()).as('cookieParser');
  app.use(express.session({
    cookie: { maxAge: 60000 * 60 * 24 * 7 }, // One week
    secret: settings.cookieSecret
  })).as('session');

  app.use(passport.initialize()).as('passport.initialize');
  app.use(passport.session()).as('passport.session');

  app.use(express.methodOverride()).as('methodOverride');
  app.use(controllers.route.middleware).as('route');

  _.extend(app, controllers.app);

  exports.app = app; //## Is this good or bad practice?
  return app;
};

exports.express = express;
exports.mongoose = mongoose;
exports.controllers = controllers;
exports.utils = require('./utils');

// Sooner or later this will be a necessary evil
global.presspress = exports;
