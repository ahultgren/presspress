"use strict";

/**
 * This controller should always be used when rendering views. It does stuff
 * such as ensuring global local.* properties.
 */

var
// Dependencies
    mongoose = require('mongoose'),
    express = require('express'),
    hooks = require('./hooks'),
    _ = require('underscore'),
// Vars
    _render,
    globalBase = {
      sitename: 'Site name',
      title: '',
      hasPost: function () {
        var locals = this;

        if (!('_i' in locals)) {
          locals._i = 0;
        }

        return !!locals.posts && locals.posts[locals._i];
      },
      thePost: function () {
        var locals = this;

        if (!('_i' in locals)) {
          locals._i = 0;
        }

        locals.post = locals.posts[locals._i];
        locals._i++;
      },
      head: function () {
        return this._head.join('');
      },
      foot: function () {
        return this._foot.join('');
      }
    };


/* Initialization
============================================================================= */

hooks.on('hooks.register', function (hooks, next) {
  hooks.register('render');
  hooks.register('render.first');
  next();
});

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', 0, function (app, next) {
    // Global default properties
    _.extend(app.locals, globalBase);

    // Hack into response.render
    _render = express.response.render;
    express.response.render = exports.render;

    // Expose other custom response methods
    express.response.resolveViewPath = exports.resolveViewPath;
    express.response.data = exports.data;

    next();
  });

  next();
});


/* Mehtods extended on express.response
============================================================================= */

module.exports = exports  = function (req, res, next) {
  // Defaults for render-related params
  res.view = '';
  res._data = {
    _head: [],
    _foot: []
  };

  hooks.do('render.first', req, res, next);
};

exports.render = function (view, data, callback) {
  var res = this;
  data = data || {};


  hooks.do('render', res, function (err) {
    if (err) {
      callback = callback || function () {};
      return callback(err);
    }

    _.extend(data, res._data);
    res.view = view || res.view;

    res.resolveViewPath(function (err) {
      if(res.view) {
        _render.call(res, res.view, data, callback);
      }
      else {
        res.json(data, callback);
      }
    });
  });
};

// Rewrite view path
exports.resolveViewPath = function (callback) {
  var res = this,
      view = res.view.split('/'),
      themePath = res.app.settings['theme.folder'];

  switch (view.shift()) {
    case 'admin':
      view.unshift('views', 'admin');
      break;
    case 'theme':
      view.unshift('themes');
      break;
  }

  res.view = view.join('/');

  callback(null, res);
};

// Add response data
exports.data = function (data) {
  var res = this;

  _.extend(res._data, data);
};
