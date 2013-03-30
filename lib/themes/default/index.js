"use strict";

var controllers = require('../../controllers');

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

exports.install = function (done) {
  controllers.route.add({
    method: 'get',
    path: '/',
    view: 'theme/index',
    callbacks: function (req, res, next) {
      mongoose.model('Post').find({ type: 'post' }).populate('author').limit(5).exec(function (err, posts) {
        res.data.posts = posts;
        res.render();
      });
    }
  });
};
