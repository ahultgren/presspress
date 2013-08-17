"use strict";

var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = function () {
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
