"use strict";

var mongoose = require('mongoose'),
    Post;

function urlProof (alias) {
  return alias.toLowerCase().replace(' ', '-').replace(/[^0-9a-z\-_]/g, '');
}


/**
 * Post
 * 
 * Model for all post types, including posts, pages etc
 */

Post = new mongoose.Schema({
  title: { type: String, required: true },
  alias: { type: String, index: { unique: true }, match: /^[0-9a-z\-_]+$/g, set: urlProof},
  content: String,
  author: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  edited: { type: Array, "default": [] },
  type: { type: String, default: 'post', index: true }
});

Post.pre('save', function (next) {
  if (!this.alias) {
    this.set('alias', this.title);
  }

  this.edited.push(Date.now());
  next();
});

Post.virtual('created')
.get(function () {
  return this._id.getTimestamp();
});

Post.virtual('url.view')
.get(function () {
  return '/' + this.type + '/' + this.alias; //## Must fix type.alias or something
});

Post.virtual('url.edit')
.get(function () {
  return '/admin/' + this.type + '/edit/' + this._id; //## Must fix type.alias or something
});

module.exports = Post;
