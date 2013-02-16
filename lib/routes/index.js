"use strict";

var mongoose = require('mongoose');

exports.index = function (req, res, next) {
  res.view = 'theme/index';

  mongoose.model('Post').find({ type: 'post' }).populate('author').limit(5).exec(function (err, posts) {
    res.data.posts = posts;
    res.render();
  });
};

exports.admin = require('./admin');
