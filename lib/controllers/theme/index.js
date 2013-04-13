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
    activeTheme;


/* Initialization
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    async.waterfall([
      function (callback) {      
        callback(null, themesFolder);
      },
      fs.readdir.bind(fs),
      function (folders, callback) {
        // Load all themes
        async.each(folders, function (folder, done) {
          var theme,
              ext = path.extname(folder);

          if(folder[0] !== '.' && (ext === '' || ext === '.js')) {
            try {
              theme = new Theme(folder, path.join(themesFolder, folder), require(path.join(themesFolder, folder)));
            } catch(e) {
              console.log(e);
            }

            if(theme) {
              themes[folder] = theme;
            }
          }

          done();
        }, callback);
      },
      function (callback) {
        // Activate chosen theme or default
        exports.activateTheme(app.get('activeTheme') || 'default', callback);
      }
    ], next);
  });

  next();
});


/* Public methods
============================================================================= */

exports.activateTheme = function (name, callback) {
  if (themes[name]) {
    themes[name].install(callback);
  }
  else {
    callback(new Error('Theme not found'));
  }
};


exports.inactivateTheme = function (name, callback) {
  if(themes[name]) {
    themes[name].uninstall();
    callback();
  }
  else {
    callback(new Error('Theme not found'));
  }
};
