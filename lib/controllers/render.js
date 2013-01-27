"use strict";

/**
 * This controller should always be used when rendering views. It does stuff
 * such as ensuring global local.* properties in general and specific properties
 * for specific view such as single posts.
 */

var _ = require('underscore'),
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
          that._i = -1;
        }

        that.post = that.posts[that._i];
        that._i++;
      }
    },
    singleBase = {
      posts: []
    };

/**
 * Middleware for exposing the api on res
 */
module.exports = function (req, res, next) {
  // Global default properties
  _.extend(res.locals, globalBase);

  // Render a single post
  res.singlePost = function (view, data, callback) {
    data = _.extend({}, singleBase, data);
    res.render(view, data, callback);
  };

  next();
};