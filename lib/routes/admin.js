"use strict";

var mongoose = require('mongoose');


/**
 * Dashboard
 */
module.exports = function (req, res, next) {
  mongoose.model('Post').find({ type: 'post' }).limit(5).exec(function (err, posts) {
    res.data({ posts: posts });
    next();
  });
};

/**
 * Login form
 */
module.exports.login = function (req, res, next) {
  res.render();
};

module.exports.posts = require('./posts');
