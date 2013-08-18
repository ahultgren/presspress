"use strict";


var mongoose = require('mongoose'),
    passport = require('passport'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    hooks = require('../hooks'),
    route = require('../route');


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
    });

    app.before('route').use(passport.initialize()).as('passport.initialize');
    app.before('route').use(passport.session()).as('passport.session');

    registerRoutes(app);

    next();
  });

  next();
});

function registerRoutes (app) {
  /*global presspress*/
  var flow = presspress.utils.flow;

  route.add({
    // Login
    path: '/admin/login',
    view: '../../views/auth/login.jade',
    callbacks: flow.stop()
  });

  Object.keys(exports.strategies).forEach(function (strategy) {
    exports.strategies[strategy].routes.forEach(function (r) {
      route.add({
        method: 'POST',
        path: '/admin/login/' + strategy + r.path,
        callbacks: r.callbacks.concat([exports.done, flow.redirect('/admin')])
      });
    });
  });

  // Must be logged in
  route.add({
    method: 'all',
    path: '/admin*',
    callbacks: [exports.mustBeLoggedIn(2), flow.redirectIf('statusCode', 303)]
  });
}


/* Public methods
============================================================================= */

exports.serialize = function (user, done) {
  done(null, user._id);
};

exports.deserialize = function (id, done) {
  mongoose.model('User').findById(id, done);
};

exports.done = function (req, res, next) {
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
