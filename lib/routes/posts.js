"use strict";
var mongoose = require('mongoose'),
    postController = require('../controllers').posts;


/**
 * createOrEditPostView
 */
function createOrEditPostView (req, res, next, post) {
  res.singlePost('admin/posts/single', {
    title: !post ? 'Create new post' : 'Edit post',
    posts: [post || {}]
  });
}

/**
 * GET /admin/posts/create
 */
exports.create = function (req, res, next) {
  createOrEditPostView(req, res, next);
};


/**
 * GET /admin/posts/edit/:id
 */
exports.edit = function (req, res, next) {
  mongoose.model('Post').findById(req.params.id, function (err, post) {
    if (!err && post) {
      createOrEditPostView(req, res, next, post);
    }
  });
};


/**
 * POST /admin/posts/create
 * POST /admin/posts/edit/[:id]
 *
 * Create or update a post
 */
exports.publish = function (req, res, next) {
  postController.create({
    type: 'post',
    id: req.body.id,
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
