"use strict";

var async = require('async');


/**
 * Do initalization stuff
 */
module.exports = function (app) {
  var hooks = module.exports.hooks;

  async.waterfall([
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

  return module.exports;
};

// Load hooks and register init hook
module.exports.hooks = require('./hooks');
module.exports.hooks.on('hooks.register', function (hooks, next) {
  hooks.register('core.init');
  next();
});

// Load the rest of the controllers
module.exports.auth = require('./auth');
module.exports.posts = require('./posts');
module.exports.render = require('./render');
module.exports.route = require('./route');
module.exports.theme = require('./theme');
module.exports.public = require('./public');
