"use strict";

var mongoose = require('mongoose');


/**
 * Dashboard
 */
module.exports = function (req, res, next) {
  mongoose.model('Post').find({ type: 'post' }).limit(5).sort({ _id: -1 }).exec(function (err, posts) {
    res.data({ posts: posts });
    next();
  });
};

module.exports.posts = require('./posts');
