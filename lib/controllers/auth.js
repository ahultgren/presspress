"use strict";
var mongoose = require('mongoose'),
    url = require('url'),
    LocalStrategy = require('passport-local').Strategy;

exports.serialize = function (user, done) {
  done(null, user._id);
};

exports.deserialize = function (id, done) {
  mongoose.model('User').findById(id, done);
};

exports.LocalStrategy = function () {
  return new LocalStrategy({
    usernameField: 'email'
  },
  function (email, password, done) {
    mongoose.model('User').findOne({ email: email }, function (err, user) {
      if (err) {
        return done(err);
      }
      else if (!user) {
        return done(null, false);
      }
      else {
        user.auth(password, function (authed) {
          if (authed) {
            return done(null, user);
          }
          return done(null, false);
        });
      }
    });
  });
};

exports.localDone = function (req, res) {
  if(req.query.redirect) {
    res.redirect(303, req.query.redirect); //## Check that this is the same host to avoid redirect exploits
  }
  else {
   res.redirect(303, '/admin'); 
  }
};

exports.mustBeLoggedIn = function (level) {
  return function (req, res, next) {
    if(req.user && req.user.authLevel > level) {
      next();
    }
    else {
      res.redirect(303, '/admin/login?redirect=' + encodeURIComponent(req.path + (url.parse(req.url).search || '')));
    }
  };
};
