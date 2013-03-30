"use strict";

/**
 * This controller handles routing views. All routes for admin may be contained
 * here, while a theme should take care of front-end routes somehow.
 */

var
// Dependencies
    async = require('async'),
    _ = require('underscore'),
    hooks = require('../index').hooks,
    Route = require('express').Route,
// Vars
    app;


/* Initalization
============================================================================= */

exports.routes = [];

hooks.register('beforeRoute');
hooks.register('afterRoute');

hooks.on('init', function (_app, next) {
  app = _app;
  addAdminRoutes();
  next(null, _app);
});


/* Private methods
============================================================================= */

function addAdminRoutes () {
  require('./adminRoutes').forEach(function (route) {
    exports.add({
      path: route.path,
      view: route.view,
      method: route.method,
      callbacks: route.callbacks
    });
  });
}


/* Public methods
============================================================================= */

/**
 * This middleware should catch all and every route (except statics).
 */
module.exports = function (req, res, next) {
  res.path = req.path.split('/').slice(1);

  async.waterfall([
    function (callback) {
      hooks.do('beforeRoute', req, callback);
    },
    function (req, callback) {
      exports.route(req, res, callback);
    },
    function (req, callback) {
      hooks.do('afterRoute', req, callback)
    }
  ],
  function (err) {
    if(!err) {
      res.render();
    }
    else {
      next(err);
    }
  });
};

exports.route = function (req, res, done) {
  async.eachSeries(exports.routes.filter(function (route) {
    return route.method.toUpperCase() === req.method || route.method.toUpperCase() === 'ALL';
  }),
  function (route, next) {
    if(!route.match(req.path)) {
      return next();
    }

    res.view = route.view || res.view;
    req.params = route.params || req.params;

    async.eachSeries(route.callbacks, function (middleware, next) {
      middleware(req, res, next);
    }, next);
  },
  function (err) {
    done(err, req);
  });
};


/**
 * add
 *
 * Adds an express-style route to the chain of routes, which will be matched in
 * order of addedness.
 *
 * @param options (object)
 *  @param path* (string|regexp) The path to match against, express-style.
 *  @param view (string) Path to a view.
 *  @param method (string) Method to match. get, post, pout, delete or all.
 *  @param theme (string) Identifier of the theme, if any, that created the route.
 *  @param callbacks (function|[function]) Function or array of functions which 
 *    will be called when the path is matched. Express calles it middleware.
 *
 * @return (object|Error) exports object, for chaining or Error if somethings wrong.
*/

exports.add = function (options) {
  var route;

  // Make everything but path and view or callbacks optional
  if(!options.path || !options.view && !options.callbacks) {
    return new Error('Not enough arguments to .add(), needs at least path and view or callbacks.');
  }

  // Make sure callbacks is an array (aka accept a single callback too)
  options.callbacks = [].concat(options.callbacks);

  route = new Route(options.method || 'GET', options.path, options.callbacks);
  route.theme = options.theme;
  route.view = options.view;

  exports.routes.push(route);
  return exports;
};
