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
    route = require('../route'),
    pub = require('../public'),
    posts = require('../posts'),
    media = require('../media'),
    Admin = require('./Admin');


function Theme (path) {
  this.path = path;
  this.theme = require(path);
  this.registeredFiles = [];
  this.admin = new Admin(this);
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
  this.theme.install(this, callback || function(){});
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
  route.remove('theme', this.path);
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
    view: newRoute.view && path.join(this.path, newRoute.view) || undefined,
    method: newRoute.method,
    theme: this.path,
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

  dir = path.resolve(this.path, dir);
  callback = callback || typeof url === 'function' && url || function(){};
  url = typeof url === 'string' && url || '/theme';

  pub.addFolder(dir, url, function (err, added, failed) {
    that.registeredFiles.concat(added);
    callback(err, added, failed);
  });
};


/**
 * .registerPostType
 *
 * Regsiter a posttype, get a ui in admin
 *
 * @param id (String) The identifier of the type (eg "post")
 * @param options (Object) See controllers.post.registerType, except .type
 * @callback ([Error]) Called when done
 */

Theme.prototype.registerPostType = function(id, options, callback) {
  options.theme = this.path;
  posts.registerType(id, options, callback);
};


/**
 * .addImageSize
 *
 * When uploading an image it will be resized to a bunch of sizes automatically.
 * Add such a size using this function.
 *
 * @param width (Number)
 * @param height (Number)
 * @param [hard] (Boolean) If set to true the image will be cropped to fit the
 *  width and height exactly.
 */

Theme.prototype.addImageSize = media.addImageSize;


module.exports = Theme;
