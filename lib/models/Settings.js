"use strict";

var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    hamster = require('hamster'),
    Settings, cache = {};


/**
 * Settings
 *
 * Model for storing data that will be accessed very often (like several times
 * for each request) but changed very seldom (like only when admin changes something).
 * Uses Hamster to cache values.
 */

Settings = new mongoose.Schema({
  key: { type: String, index: { unique: true } },
  value: mongoose.Schema.Types.Mixed
});


/* Static methods
============================================================================= */

Settings.statics.getValue = hamster(function (key, callback) {
  this.findOne({ key: key }, function (err, data) {
    callback(err, data && data.value || undefined);
  });
});

Settings.statics.setValue = function (key, value, callback) {
  callback = callback || function () {};

  this.update({ key: key }, { value: value }, { upsert: true }, function (err, item) {
    callback(err, item);
  });
};


module.exports = exports = Settings;
