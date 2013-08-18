"use strict";


var mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
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
    callbacks: [strategyLoginViews, flow.stop()]
  });

  Object.keys(exports.strategies).forEach(function (strategy) {
    if(exports.strategies[strategy].routes) {
      exports.strategies[strategy].routes('/admin/login').forEach(function (r) {
        route.add({
          method: 'POST',
          path: '/admin/login/' + strategy + r.path,
          callbacks: r.callbacks.concat([exports.success, flow.redirect('/admin')])
        });
      });
    }
  });

  // Must be logged in
  route.add({
    method: 'all',
    path: '/admin*',
    callbacks: [exports.mustBeLoggedIn(2), flow.redirectIf('statusCode', 303)]
  });
}

function strategyLoginViews (req, res, next) {
  async.map(Object.keys(exports.strategies), function (strategy, next) {
    if(exports.strategies[strategy].loginView) {
      exports.strategies[strategy].loginView(next);
    }
    else {
      next();
    }
  }, function (err, views) {
    views = views.filter(Boolean);

    res.data({ loginViews: views });
    next();
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


/**
 * success
 *
 * Redirect to the previously specified redirectUrl, or default /admin
 */

exports.success = function (req, res, next) {
  res.redirectPath = req.session.redirect || '/admin';
  res.status(303);
  next();
};


/**
 * mustBeLoggedIn
 *
 * Ensures that any request to /admin routes are made by an authorized user.
 * Unauthorized requests are redirected to the login page.
 * //## TODO: 403 for rest/json requests
 *
 * @param level (Number) Required level. Deprecated and soon replace by capabilities
 * @return (Function) Middleware
 */

exports.mustBeLoggedIn = function (level) {
  return function (req, res, next) {
    if(!req.user || req.user.authLevel < level) {
      req.session.redirect = req.url;
      res.status(303);
      res.redirectPath = '/admin/login';
    }

    next();
  };
};
