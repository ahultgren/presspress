"use strict";

var mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = exports = function () {
  return new LocalStrategy({
    usernameField: 'email'
  },
  function (email, password, done) {
    mongoose.model('User').verifyPassword(email, password, function (err, result) {
      if(err) {
        return done(err);
      }
      
      if(!result) {
        return addUserIfNoneExists(email, password, done);
      }

      done(err, result);
    });
  });
};

exports.routes = function (adminUrl) {
  return [{
    path: '',
    callbacks: [passport.authenticate('local', {
      failureRedirect: adminUrl
    })]
  }];
};


function addUserIfNoneExists (email, password, done) {
  var User = mongoose.model('User');

  User.count({}, function (err, count) {
    if(err || count) {
      return done(err);
    }

    new User({
      email: email,
      password: password
    }).save(done);
  });
}
