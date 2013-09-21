"use strict";

var mongoose = require('mongoose'),
    express = require('express'),
    async = require('async'),
    path = require('path');


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
  theme.addImageSize('post_header', 1200, 999);

  theme.registerFolder('./public', '/theme/public');

  theme.addRoute({
    method: 'get',
    path: '/',
    view: 'views/index.dot',
    callbacks: [enqueue, function (req, res, next) {
      presspress.controllers.posts.get({
        featuredImage: true
      }, setData(req, res, next));
    }]
  });

  theme.addRoute({
    method: 'get',
    path: '/post/:alias',
    view: 'views/index.dot',
    callbacks: [enqueue, function (req, res, next) {
      presspress.controllers.posts.get({
        featuredImage: true
      }, {
        alias: req.params.alias
      }, setData(req, res, next));
    }]
  });
};

function setData (req, res, next) {
  return function (err, posts) {
    mongoose.model('Settings').getValue('sitetitle', function (err, sitetitle) {
      res.data({ posts: posts, sitetitle: sitetitle });
      next();
    });
  };
}

function enqueue (req, res, next) {
  res.enqueueScript({
    uri: 'http://code.jquery.com/jquery-1.9.0.min.js',
    foot: true
  }, {
    uri: '/theme/public/dist/script.min.js',
    foot: true
  });

  res.enqueueStyle({
    uri: '/theme/public/dist/style.css'
  });

  next();
}
