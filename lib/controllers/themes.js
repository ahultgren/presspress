"use strict";

var path = require('path'),
    async = require('async'),
    fs = require('fs'),
    hooks = require('./hooks'),
    themesFolder = path.join(__dirname, '..', 'themes'),
    themes = {},
    activeTheme;

/**
 * This controller handles themes. What themes are available, which one is activated?
 */

hooks.on('init', function (app, next) {
  async.waterfall([
    function (callback) {
      callback(themesFolder);
    },
    fs.readdir.bind(fs),
    function (folders, callback) {
      // Load all themes
      async.each(folders, function (folder, done) {
        themes[folder] = require(folder);
        done();
      }, callback);
    },
    function (callback) {
      var theme;

      // Activate chosen theme or default
      exports.activateTheme(app.get('activeTheme') || 'default', callback);
    }
  ],
  function (err) {
    app.themes = themes;
    next(null, app);
  });
});


exports.activateTheme = function (name, callback) {
  //## Check for already active theme and inactivate?
  if (themes[name]) {
    themes[name].install(callback);
  }
  else {
    callback(new Error('Theme not found'));
  }
};
