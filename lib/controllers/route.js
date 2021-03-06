"use strict";

/**
 * This controller handles routing views.
 */

var
// Dependencies
    async = require('async'),
    _ = require('underscore'),
    hooks = require('./index').hooks,
    Route = require('express').Route,
    stack = require('callsite'),
    path = require('path'),
// Vars
    app;


/* Initalization
============================================================================= */

exports.routes = [];

hooks.on('hooks.register', function (hooks, next) {
  hooks.register('route.before');
  hooks.register('route.after');
  next();
});

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (_app, next) {
    app = _app;
    next();
  });

  next();
});


/* Public methods
============================================================================= */

/**
 * This middleware should catch all and every route (except statics).
 */
exports.middleware = function (req, res, next) {
  res.path = req.path.split('/').slice(1);

  async.waterfall([
    function (callback) {
      hooks.do('route.before', req, res, callback);
    },
    function (callback) {
      exports.route(req, res, callback);
    },
    function (callback) {
      hooks.do('route.after', req, res, callback);
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
    done(err);
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
 *  @param view (string) Path to a view, absolute or relative to the calling file.
 *  @param method (string) Method to match. get, post, pout, delete or all.
 *  @param theme (string) Identifier of the theme, if any, that created the route.
 *  @param callbacks (function|[function]) Function or array of functions which 
 *    will be called when the path is matched. Express calles it middleware.
 *
 * @return (object|Error) exports object, for chaining or Error if somethings wrong.
*/

exports.add = function (options) {
  var route, callDir;

  // Make everything but path and view or callbacks optional
  if(!options.path || !options.view && !options.callbacks) {
    return new Error('Not enough arguments to .add(), needs at least path and view or callbacks.');
  }

  // Make sure callbacks is an array (aka accept a single callback too)
  options.callbacks = [].concat(options.callbacks);

  route = new Route(options.method || 'GET', options.path, options.callbacks);
  route.theme = options.theme;

  callDir = path.dirname(stack()[1].getFileName());
  route.view = options.view && path.resolve(callDir, options.view) || undefined;

  exports.routes.push(route);
  return exports;
};


/**
 * remove
 *
 * Remove all routes by matching properties. Later I might add an id or something.
 * Or give the Route class its own remove method.
 *
 * @param property (string) property to match
 * @param value (mixed) value to match
 * @return (object) Exports object for chaining
 */

exports.remove = function (property, value) {
  var routes = exports.routes,
      route, i;

  for(i = routes.length; i--;) {
    route = routes[i];

    if(route[property] && route[property] === value) {
      delete routes[i];
    }
  }

  return exports;
};


/**
 * find
 *
 * Naive find method. This whole module should be refactored to a Reol if possible
 */

exports.find = function (property, value) {
  var i;

  for(i = exports.routes.length; i--;) {
    if(exports.routes[i][property] === value) {
      return exports.routes[i];
    }
  }
};
