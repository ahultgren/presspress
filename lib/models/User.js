"use strict";

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    async = require('async'),
    User;


/**
 * User
 *
 * Model for every registered user and admin.
 */

User = new mongoose.Schema({
  email: { type: String, index: {unique: true}, match: /[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/ },
  name: {
    first: String,
    last: String
  },
  hashed_password: String,
  password: String // This shall _never_ store anything, just here for api purposes
});


/* Virtual name properties */

User.virtual('name.full')
  .get(function () {
    return this.name.first + ' ' + this.name.last;
  })
  .set(function (newname) {
    var name = newname.split(' '),
        first = name.slice(0, -1).join(' '),
        last = name[name.length - 1];

    this.set('name.first', first);
    this.set('name.last', last);
  });


/* Auth statics, methods, and hooks
============================================================================= */

/**
 * #verifyPassword
 *
 * Check if the combination of user and password exists
 */

User.statics.verifyPassword = function (email, password, done) {
  // All arguments are required
  if(!done || !password) {
    return done(new Error('Email and password is required'));
  }

  async.waterfall([
    function (next) {
      mongoose.model('User').findOne({
        email: email
      }, next);
    },
    function (user, next) {
      if(!user) {
        return next();
      }

      user.verifyPassword(password, function (err, result) {
        next(err, result && user);
      });
    }
  ], done);
};


/**
 * .verifyPassword
 *
 * Check if the password is correct for this user
 */

User.method('verifyPassword', function (password, callback) {
  bcrypt.compare(password, this.hashed_password, callback);
});


User.method('generateHash', function (callback) {
  var self = this;

  bcrypt.hash(self.password, 12, function (err, hash) {
    self.hashed_password = hash;
    callback(err);
  });
});


/**
 * Pre save hook
 *
 * Generates hash if needed before saving the document
 */

User.pre('save', function (done) {
  if(!this.password) {
    return done();
  }

  this.generateHash(done);
});

// Never save password
User.pre('save', function (done) {
  this.password = null;
  delete this.password;
  done();
});


module.exports = User;
