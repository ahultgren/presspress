"use strict";

var mongoose = require('mongoose'),
    postController = require('../controllers').posts;


/**
 * createOrEditPostView
 */
function createOrEditPostView (req, res, next, post) {
  res.data = {
    title: !post ? 'Create new post' : 'Edit post',
    posts: [post || {}]
  };

  res.view = 'admin/posts/single';
  next();
}

/**
 * GET /admin/posts/create
 */
exports.create = createOrEditPostView;


/**
 * GET /admin/posts/edit/:id
 */
exports.edit = function (req, res, next) {
  mongoose.model('Post').findById(req.params.id, function (err, post) {
    if(err) {
      return next(err);
    }

    createOrEditPostView(req, res, next, post);
  });
};


/**
 * POST /admin/posts/create
 * POST /admin/posts/edit/[:id]
 *
 * Create or update a post
 */
exports.publish = function (req, res, next) {
  var post = {
    type: 'post',
    title: req.body.title,
    markdown: req.body.markdown,
    author: req.user
  };

  if(req.body.id) {
    post._id = req.body.id;
  }

  postController.createOrUpdate(post, function (err, post) {
    if (!err && post) {
      res.redirect(303, '/admin/posts/edit/' + post._id);
    }
    else {
      next(err);
    }
  });
};


/**
 * POST /admin/posts/delete/:id
 *
 * Delete a post
 */
exports.delete = function (req, res, next) {
  postController.delete(req.params.id, next);
};
