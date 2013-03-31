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
    route = require('../index').route;

function Theme (name, theme) {
  this.name = name;
  this.theme = theme;
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

module.exports = Theme;
