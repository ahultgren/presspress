"use strict";

/**
 * Do initalization stuff
 */
module.exports = function (app) {
  module.exports.hooks.do('init', app);
  return module.exports;
};

// Load hooks and register init hook
module.exports.hooks = require('./hooks');
module.exports.hooks.register('init');

// Load the rest of the controllers
module.exports.auth = require('./auth');
module.exports.posts = require('./posts');
module.exports.render = require('./render');
