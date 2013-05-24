"use strict";

/**
 * This controller handles themes. What themes are available, which one is activated?
 */

var
// Dependencies
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    hooks = require('../hooks'),
// Vars
    themesFolder = path.join(__dirname, '..', '..', 'themes'),
    themes = {},
    Theme = require('./Theme'),
    activeTheme, activeAdminTheme;


/* Initialization
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.start', function (app, next) {
    if(!activeTheme) {
      exports.register(path.resolve(__dirname, '../../../demo/themes/default'));
      exports.activate(path.resolve(__dirname, '../../../demo/themes/default'));
    }
    if(!activeAdminTheme) {
      exports.registerAdmin(path.resolve(__dirname, '../../../demo/themes/default-admin'));
      exports.activateAdmin(path.resolve(__dirname, '../../../demo/themes/default-admin'));
    }

    next();
  });

  next();
});


/* Public methods
============================================================================= */

exports.register = function (path) {
  if(!themes[path]) {
    themes[path] = new Theme(path);
  }
};

exports.registerAdmin = function (path) {
  exports.register(path);
};

exports.activate = function (name, callback) {
  if (themes[name]) {
    themes[name].install(callback);
    activeTheme = themes[name];
  }
  else {
    callback(new Error('Theme not found'));
  }
};

exports.activateAdmin = function (name, callback) {
  if (themes[name]) {
    themes[name].install(callback);
    activeAdminTheme = themes[name];
  }
  else {
    callback(new Error('Theme not found'));
  }
};

exports.inactivate = function (name, callback) {
  if(themes[name]) {
    themes[name].uninstall();
    callback();
  }
  else {
    callback(new Error('Theme not found'));
  }
};
