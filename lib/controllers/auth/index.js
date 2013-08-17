"use strict";


var mongoose = require('mongoose'),
    passport = require('passport'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    hooks = require('../hooks');


/* Import and expose strategies automatically
============================================================================= */

exports.strategies = {};

fs.readdirSync(path.join(__dirname, 'strategies')).forEach(function (file) {
  var basename = path.basename(file, '.js'),
      fullname = path.join(__dirname, 'strategies', file);

  if(path.extname(file) === '.js') {
    exports.strategies[basename] = require(fullname);
  }
});


/* Initalize
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    /**
     * Configure passport strategies
     * 
     * Add strategies for authenticating user via passport
     */

    passport.serializeUser(exports.serialize);
    passport.deserializeUser(exports.deserialize);

    Object.keys(exports.strategies).forEach(function (strategy) {
      passport.use(exports.strategies[strategy]());
      //## Set up routes per strategy
    });

    app.before('route').use(passport.initialize()).as('passport.initialize');
    app.before('route').use(passport.session()).as('passport.session');

    next();
  });

  next();
});


/* Public methods
============================================================================= */

exports.serialize = function (user, done) {
  done(null, user._id);
};

exports.deserialize = function (id, done) {
  mongoose.model('User').findById(id, done);
};

exports.localDone = function (req, res, next) {
  res.redirectPath = req.query.redirect || '/admin';
  res.status(303);
  next();
};

exports.mustBeLoggedIn = function (level) {
  return function (req, res, next) {
    if(!req.user || req.user.authLevel < level) {
      res.status(303);
      res.redirectPath = '/admin/login?redirect=' + encodeURIComponent(req.path + (url.parse(req.url).search || ''));
    }

    next();
  };
};
