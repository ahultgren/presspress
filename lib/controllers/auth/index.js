"use strict";


var mongoose = require('mongoose'),
    url = require('url'),
    fs = require('fs'),
    path = require('path');


/* Import and expose strategies automatically
============================================================================= */

exports.strategies = {};

fs.readdirSync(path.join(__dirname, 'strategies')).forEach(function (file) {
  var basename = path.basename(file, '.js'),
      fullname = path.join(__dirname, 'strategies', file);

  if(path.extname(file) === '.js') {
    exports.strategies[basename] = require(fullname);
  }
});


/* Public methods
============================================================================= */

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
