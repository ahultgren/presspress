"use strict";

/**
 * This is the admin theme. The goal is that everything in the admin should be
 * customizeable from here. It should be easy to create a new theme and inherit
 * another theme to extend its functionality.
 */

var routes = require('./routes');


exports.info = require('./package.json');

exports.install = function (theme, done) {
  theme.registerFolder('./public', '/presspress');

  routes.forEach(function (route) {
    theme.addRoute({
      path: route.path,
      view: route.view,
      method: route.method,
      callbacks: route.callbacks
    });
  });

  done();
};
