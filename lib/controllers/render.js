"use strict";

/**
 * This controller should always be used when rendering views. It does stuff
 * such as ensuring global local.* properties in general and specific properties
 * for specific view such as single posts.
 */

var
// Dependencies
    mongoose = require('mongoose'),
    hooks = require('./hooks'),
    _ = require('underscore'),
    response = require('http').ServerResponse.prototype,
// Vars
    _render = response.render,
    globalBase = {
      sitename: 'Site name',
      title: '',
      hasPost: function () {
        var that = this;

        if (!('_i' in that)) {
          that._i = 0;
        }

        return !!that.posts[that._i];
      },
      thePost: function () {
        var that = this;

        if (!('_i' in that)) {
          that._i = 0;
        }

        that.post = that.posts[that._i];
        that._i++;
      }
    },
    singleBase = {
      posts: []
    };

// Hack into the response prototype to hijack res.render
response.render = function (view, data, callback) {
  hooks.do('beforeRender', { data: data, view: view }, function (err, data) {
    if (!err) {
      _render.call(this, data.view, data.data, callback);
    }
    else {
      callback(err);
    }
  });
};

// Register hooks
hooks.register('beforeRender');

// Hook into hooks
hooks.on('init', function (app, next) {
  // Global default properties
  _.extend(app.locals, globalBase);
  next(null, app);
});

/**
 * Middleware for exposing the api on res
 */
module.exports = function (req, res, next) {
  var _render = res.render;

  // Render a single post
  res.singlePost = function (view, data, callback) {
    data = _.extend({}, singleBase, data);
    res.render(view, data, callback);
  };

  next();
};
