"use strict";
var mongoose = require('mongoose');


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
