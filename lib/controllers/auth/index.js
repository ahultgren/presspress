"use strict";


var mongoose = require('mongoose'),
    url = require('url');

exports.strategies = {
  local: require('./strategies/local')
};


exports.serialize = function (user, done) {
  done(null, user._id);
};

exports.deserialize = function (id, done) {
  mongoose.model('User').findById(id, done);
};

exports.localDone = function (req, res, next) {
  res.redirectPath = req.query.redirect || '/admin';
  res.status(303);
  next();
};

exports.mustBeLoggedIn = function (level) {
  return function (req, res, next) {
    if(!req.user || req.user.authLevel < level) {
      res.status(303);
      res.redirectPath = '/admin/login?redirect=' + encodeURIComponent(req.path + (url.parse(req.url).search || ''));
    }

    next();
  };
};
