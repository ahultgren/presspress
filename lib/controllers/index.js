"use strict";

var async = require('async');


/**
 * Do initalization stuff
 */
module.exports = exports = function (app) {
  var hooks = module.exports.hooks;

  async.series([
    function (next) {
      hooks.do('hooks.register', hooks, next);
    },
    function (next) {
      hooks.do('hooks.listen', hooks, next);
    },
    function (next) {
      hooks.do('core.init', app);
    }
  ]);

  return exports;
};

// Load hooks and register init hook
exports.hooks = require('./hooks');
exports.hooks.on('hooks.register', function (hooks, next) {
  hooks.register('core.init');
  next();
});

// Load the rest of the controllers
exports.app = require('./app');
exports.auth = require('./auth');
exports.posts = require('./posts');
exports.render = require('./render');
exports.route = require('./route');
exports.admin = require('./admin');
exports.theme = require('./theme');
exports.public = require('./public');
