"use strict";

var mongoose = require('mongoose'),
    UDate = require('../utils').Date,
    undiacritics = require('../utils').undiacritics,
    Post;

function urlProof (alias) {
  return (
    // Convert latin-like international chars
    undiacritics(alias.toLowerCase())
    // Convert spaces to dashes
    .replace(/ /g, '-')
    // Remove everything that's not lower case letters, numbers, dashes or underscores
    // as well as leading and trailing dashes and underscores
    .replace(/[^a-z0-9\-_]|^[\-_]*|[\-_]*$/g, ''));
}

function getFirstAvailableAlias (alias, callback) {
  mongoose.model('Post').findOne({ alias: alias }, function (err, item) {
    if(!item) {
      callback(null, alias);
    }
    else {
      if(alias.match(/[\-][0-9]{1,2}$/)) {
        alias = alias.replace(/[\-]([0-9]{1,2})$/, function (match, number) {
          return '-' + (number*1 + 1);
        });

        callback(null, alias);
      }
      else {
        getFirstAvailableAlias(alias + '-2', callback);
      }
    }
  });
}


/**
 * Post
 * 
 * Model for all post types, including posts, pages etc
 */

Post = new mongoose.Schema({
  title: { type: String, required: true },
  alias: { type: String, index: { unique: true }, match: /^[0-9a-z\-_]+$/g, set: urlProof },
  content: String,
  author: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  edited: { type: Array, "default": [] },
  type: { type: String, default: 'post', index: true }
});

Post.pre('save', function (next) {
  var that = this;

  if (!that.alias || !that._id) {
    // Make sure the post get's a unique alias
    getFirstAvailableAlias(urlProof(that.alias || that.title), function (err, alias) {
      that.set('alias', alias);

      that.edited.push(Date.now());
      next();
    });
  }
});

Post.virtual('url.view')
.get(function () {
  return '/' + this.type + '/' + this.alias; //## Must fix type.alias or something
});

Post.virtual('url.edit')
.get(function () {
  return '/admin/posts/edit/' + this._id;
});

Post.virtual('url.delete')
.get(function () {
  return '/admin/posts/delete/' + this._id;
});

Post.methods.created = function (format) {
  return new UDate(this._id.getTimestamp()).format(format);
};

module.exports = Post;
