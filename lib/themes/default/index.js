"use strict";

var mongoose = require('mongoose');


/**
 * This is is a theme. A theme is responsible for all front end routing,
 * enqueueing of scripts/styles etc. A theme should not execute anything
 * when loaded. It shall expose an install-method, and an info-object.
 */

exports.info = {
  name: 'Default theme',
  uri: 'http://example.com',
  version: '0.0.1',
  description: 'The default theme for testing how things work.',
  license: 'MIT',
  author: {
    name: 'Andreas Hultgren',
    uri: 'http://andreashultgren.se'
  }
};

exports.install = function (theme, done) {
  theme.addRoute({
    method: 'get',
    path: '/',
    view: 'views/index.jade',
    callbacks: function (req, res, next) {
      mongoose.model('Post')
        .find({ type: 'post' })
        .sort({ '_id': -1 })
        .populate('author')
        .limit(10)
        .exec(function (err, posts) {
          res.data.posts = posts;
          next();
        });
    }
  });

  theme.addRoute({
    method: 'get',
    path: '/post/:alias',
    view: 'views/index.jade',
    callbacks: function (req, res, next) {
      mongoose.model('Post')
        .findOne({ type: 'post', alias: req.params.alias })
        .populate('author')
        .exec(function (err, post) {
          res.data.posts = [post];
          next();
        });
    }
  });
};
