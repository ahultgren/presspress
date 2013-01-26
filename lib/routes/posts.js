"use strict";
var mongoose = require('mongoose'),
    postController = require('../controllers').posts;

exports.create = function (req, res, next) {
  res.render('admin/posts/create');
};

exports.publish = function (req, res, next) {
  postController.create({
    type: 'post',
    title: req.body.title,
    content: req.body.content,
    author: req.user
  },
  function (err, post) {
    if (!err) {
      res.redirect(303, '/admin/posts/edit/' + post._id);
    }
    else {
      next(err);
    }
  });
};
