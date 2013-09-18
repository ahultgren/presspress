"use strict";
/*global presspress*/

var mongoose = require('mongoose'),
    types = [];


/**
 * get
 *
 * Get posts from a post type
 *
 * @param options
 *  @params: type (all) limit (10) sort ({ _id: -1 }) id (null)
 * @param conditions (object) Raw mongoose .find()-options
 * @callback
 *  @param (Error) Error, see mongoose
 *  @param (Object|null) Result, see mongoose
 */

exports.get = function (options, conditions, callback) {
  var model = mongoose.model('Post'),
      query;

  // options and conditions are optional
  if(!options) {
    return;
  }
  else if(!conditions) {
    callback = options;
    options = {};
  }
  else if (!callback) {
    callback = conditions;
    conditions = undefined;
  }

  // Extract conditions
  if(conditions) {
    query = model.find(conditions);
  }
  else {
    query = model.find();
  }

  // Extract options
  query.limit(options.limit !== undefined && options.limit || 10);
  query.sort(options.sort || { _id: -1 });
  //## query.where('status').equals(options.status || 'published');

  if(options.type) {
    query.where('type').equals(options.type);
  }
  if(options.id) {
    query.where('_id', options.id);
  }
  if(options.author) {
    query.populate('author');
  }

  query.exec(callback);
};


/**
 * createOrUpdate
 *
 * Simply creates or updates a post
 * See models for what fields are available
 */
exports.createOrUpdate = function (data, callback) {
  if (data._id) {
    exports.update(data, callback);
  }
  else {
    exports.create(data, callback);
  }
};

exports.create = function (data, callback) {
  mongoose.model('Post').create(data, function (err, post) {
    //## In case alias fails, retry (take a param for auto-retry?)
    if (err) { console.log(err); }

    callback(err, post);
  });
};

exports.update = function (data, callback) {
  var id = data._id;
  delete data._id;

  // Do not update anything else than post data (eg author)
  delete data.author;

  mongoose.model('Post').findById(id, function (err, post) {
    if(!post) {
      return callback(err || new Error('Post not found when trying to update'));
    }

    Object.keys(data).forEach(function (i) {
      post[i] = data[i];
    });

    post.save(callback);
  });
};

exports.delete = function (id, callback) {
  mongoose.model('Post').findById(id).remove(callback);
};

exports.registerType = function (id, options, callback) {
  var basePath = options.basePath || '/admin/' + id,
      editPath = basePath + '/edit/:id',
      createPath = basePath + '/create',
      deletePath = basePath + '/delete/:id';

  callback = callback || function(){};


  // Check that it's not added already
  if(types.indexOf(id) > -1) {
    return callback(new Error('Post type ' + id + ' already exists'));
  }
  else {
    types.push(id);
  }


  /* Add routes */

  // List-routes
  presspress.controllers.route.add({
    path: basePath,
    view: '../views/post/list.jade',
    theme: options.theme,
    callbacks: [exports.listPostView]
  });

  // Edit-routes
  presspress.controllers.route.add({
    path: editPath,
    view: '../views/post/edit.jade',
    theme: options.theme,
    callbacks: [exports.getFiles, exports.editPostView]
  });
  presspress.controllers.route.add({
    path: editPath,
    method: 'post',
    theme: options.theme,
    callbacks: [exports.editPostPost]
  });

  // Create routes
  presspress.controllers.route.add({
    path: createPath,
    view: '../views/post/create.jade',
    theme: options.theme,
    callbacks: [exports.getFiles, exports.createPostView]
  });
  presspress.controllers.route.add({
    path: createPath,
    method: 'post',
    theme: options.theme,
    callbacks: [exports.createPostPost]
  });

  // Delete route
  presspress.controllers.route.add({
    path: deletePath,
    method: 'post',
    theme: options.theme,
    callbacks: [exports.deletePostPost]
  });


  /* Add pages to menu */

  // Base page
  var basePage = presspress.controllers.admin.addPage({
    title: options.labels.plural,
    menuTitle: options.labels.plural,
    route: basePath
  });

  // List page
  presspress.controllers.admin.addPage({
    title: options.labels['View items'],
    menuTitle: options.labels['View items'],
    route: basePath,
    parent: basePage
  });

  // Add page
  presspress.controllers.admin.addPage({
    title: options.labels['Add item'],
    menuTitle: options.labels['Add item'],
    route: createPath,
    parent: basePage
  });

  callback(null);
};


//## These must know the title etc the respective type
//## A .typeData(data) middleware, mayhaps?

exports.listPostView = function (req, res, next) {
  res.data({ title: 'Posts' });
  next();
};

exports.editPostView = function (req, res, next) {
  mongoose.model('Post').findById(req.params.id, function (err, post) {
    if(err) {
      return next(err);
    }

    createOrEditPostView(req, res, next, post);
  });
};

exports.editPostPost = function (req, res, next) {
  var post = {
    type: 'post',
    title: req.body.title,
    markdown: req.body.markdown,
    featuredImage: req.body.featuredImage,
    author: req.user
  };

  if(req.body.id) {
    post._id = req.body.id;
  }

  exports.createOrUpdate(post, function (err, post) {
    if (!err && post) {
      res.redirect(303, '/admin/post/edit/' + post._id);
    }
    else {
      next(err);
    }
  });
};

exports.createPostView = createOrEditPostView;
exports.createPostPost = exports.editPostPost;

exports.deletePostPost = function (req, res, next) {
  exports.delete(req.params.id, next);
};

exports.getFiles = function (req, res, next) {
  mongoose.model('Media').find(function (err, files) {
    res.data({
      files: files
    });

    next();
  });
};


/* Private helpers
============================================================================= */

function createOrEditPostView (req, res, next, post) {
  res.data({
    title: !post ? 'Create new post' : 'Edit post',
    posts: [post || {}]
  });

  next();
}
