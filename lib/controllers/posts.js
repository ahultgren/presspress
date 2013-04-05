"use strict";
var mongoose = require('mongoose');

/**
 * createOrUpdate
 *
 * SImply creates or updates a post
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
