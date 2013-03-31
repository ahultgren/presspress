"use strict";

var mongoose = require('mongoose'),
    crypto = require('crypto'),
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
  salt: String,
  authLevel: { type: Number, "default": 0 }
});

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

User.virtual('password')
  .set(function (plainText) {
    this._password = plainText;
    this.salt = this.createSalt();
    this.hashed_password = this.encryptPassword(plainText);
  })
  .get(function () { return this._password; });

User.method('auth', function(plainText, callback) {
  if (callback){
    callback(this.encryptPassword(plainText) === this.hashed_password);
  }
  else {
    return (this.encryptPassword(plainText) === this.hashed_password);
  }
});

User.method('createSalt', function () {
  return Math.round(Math.random() * Math.random() * 133713371337) + '';
});

User.method('encryptPassword', function (password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

User.method('getLatestSignIns', function (n) {
  return this.sign_ins.sort().reverse().slice(0, n);
});

module.exports = User;