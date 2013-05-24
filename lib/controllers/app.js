"use strict";

var path = require('path'),
    mongoose = require('mongoose'),
    hooks = require('./hooks'),
    theme = require('./theme'),
    readyToStart = false;

/**
 * Presspress methods found on the presspress() object
 */


/* Initalization
============================================================================= */

hooks.on('hooks.register', function (hooks, next) {
  hooks.register('core.start');
  next();
});

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    readyToStart = true;
    next();
  });
  next();
});


/* Extending methods
============================================================================= */

exports.start = function(protocol, port, callback) {
  /*jshint validthis:true*/
  var app = this;


  /**
   * Connect to database
   *
   * Opens a connection to mongodb and then registers
   * our models within mongoose.
   */

  mongoose.connect(app.get('db-uri'), function () {
    require('../models');
  });


  // Don't start before init
  if(readyToStart) {
    start();
  }
  else {
    hooks.on('core.init', function (app, next) {
      start();
      next();
    });
  }

  function start () {
    hooks.do('core.start', app, function (err) {
      /*jshint expr:true*/
      err && console.log(err);
      protocol.createServer(app).listen(port, callback);
    });
  }
};

exports.registerTheme = function (path) {
  theme.register(resolvePath(path));
};

exports.registerAdminTheme = function (path) {
  theme.registerAdmin(resolvePath(path));
};

exports.defaultTheme = function (path) {
  theme.activate(resolvePath(path));
};

exports.defaultAdminTheme = function (path) {
  theme.activateAdmin(resolvePath(path));
};


function resolvePath (theme) {
  var basePath = require('../../.').basePath;

  if(theme.indexOf('.') === 0) {
    theme = path.resolve(basePath, theme);
  }

  return theme;
}
