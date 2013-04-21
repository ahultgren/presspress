"use strict";

/**
 * Theme
 *
 * Theme controller or whatever this should be called, acting as the interface
 * between a theme and core.
 */

var
// Dependencies
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    path = require('path'),
    async = require('async'),
    controllers = require('../index'),
    route = controllers.route;

function Theme (name, dir, theme) {
  this.name = name;
  this.root = dir;
  this.theme = theme;
  this.registeredFiles = [];
}

util.inherits(Theme, EventEmitter);


/**
 * install
 *
 * Makes this theme the active theme.
 *
 * @param callback (function) Called when done activating
 * @return (this) Self for chaining
 */

Theme.prototype.install = function(callback) {
  this.theme.install(this, callback);
  return this;
};


/**
 * uninstall
 *
 * Makes this theme stop being the active theme
 *
 * @param callbac (function) Called when done inactivating
 * @return (this) Self for chaining
 */

Theme.prototype.uninstall = function(callback) {
  route.remove('theme', this.name);
};


/**
 * addRoute
 *
 * Add a view or datahandler for this theme
 *
 * @param // see controllers.route.add
 * @return (this) Self for chaining
 */

Theme.prototype.addRoute = function(newRoute) {
  route.add({
    path: newRoute.path,
    view: path.join('theme', this.name, newRoute.view),
    method: newRoute.method,
    theme: this.name,
    callbacks: newRoute.callbacks
  });

  return this;
};


/**
 * registerFolder
 *
 * Proxy for controllers.public.addFolder which also keeps track of what was
 * added for removal when the theme is uninstalled.
 *
 * @param root (string) Path relative to the theme's root directory
 * @param [url] (string) Url path relative to the site's base url
 * @param callback (function) Called when done with any errors, added files and
 *  any failed added files.
 * @return (this) Self for chaining
 */

Theme.prototype.registerFolder = function(dir, url, callback) {
  var that = this,
      files = {};

  dir = path.join(this.root, dir);
  callback = callback || typeof url === 'function' && url || function(){};
  url = typeof url === 'string' && url || '/theme';

  controllers.public.addFolder(dir, url, function (err, added, failed) {
    that.registeredFiles.concat(added);
    callback(err, added, failed);
  });
};


module.exports = Theme;
