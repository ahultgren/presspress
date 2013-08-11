"use strict";

var mongoose = require('mongoose'),
    showdown = require('showdown'),
    converter = new showdown.converter(),
    UDate = require('../utils').Date,
    monguurl = require('monguurl'),
    Post;


/**
 * Post
 * 
 * Model for all post types, including posts, pages etc
 */

Post = new mongoose.Schema({
  title: { type: String, required: true },
  alias: { type: String, index: { unique: true } },
  markdown: String,
  content: String,
  author: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  edited: { type: Array, 'default': [] },
  type: { type: String, 'default': 'post', index: true }
});


/* Hooks
============================================================================= */

Post.plugin(monguurl());


Post.pre('save', function (next) {
  this.edited.push(Date.now());

  // Convert markdown to markup
  this.content = converter.makeHtml(this.markdown || '');
  next();
});


/* Virtuals
============================================================================= */

Post.virtual('url.view')
.get(function () {
  return '/' + this.type + '/' + this.alias; //## Must fix type.alias or something
});

Post.virtual('url.edit')
.get(function () {
  return '/admin/post/edit/' + this._id;
});

Post.virtual('url.delete')
.get(function () {
  return '/admin/post/delete/' + this._id;
});


/* Methods
============================================================================= */

Post.methods.created = function (format) {
  return new UDate(this._id.getTimestamp()).format(format);
};


module.exports = Post;
