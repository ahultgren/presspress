"use strict";

/**
 * This controller should always be used when rendering views. It does stuff
 * such as ensuring global local.* properties.
 */

var
// Dependencies
    mongoose = require('mongoose'),
    hooks = require('./hooks'),
    _ = require('underscore'),
// Vars
    _render,
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

var render = function (view, data, callback) {
  var res = this;

  hooks.do('beforeRender', { data: data, view: view }, function (err, data) {
    var view;

    if (err) {
      callback = callback || function () {};
      return callback(err);
    }

    // Rewrite view path
    view = data.view.split('/');

    switch (view.shift()) {
      case 'admin':
        view.unshift('views', 'admin');
        break;
      case 'theme':
        view.unshift('themes', res.settings['theme.folder'], 'views');
        break;
    }

    _render.call(res, view.join('/'), data.data, callback);

  });
};

// Register hooks
hooks.register('beforeRender');

// Hook into hooks
hooks.on('init', function (app, next) {
  // Global default properties
  _.extend(app.locals, globalBase);

  // Hack into the response prototype to hijack res.render
  _render = app.render;
  app.render = render;
  next(null, app);
});
