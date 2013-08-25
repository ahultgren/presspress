"use strict";

var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    Settings, cache = {};


/**
 * Settings
 *
 * Model for storing data that will be accessed very often (like several times
 * for each request) but changed very seldom (like only when admin changes something).
 * Utilizes a in-memory cache to avoid database-requests and a cronjob to either
 * clear or update the cache to support cluster and load-balancing.
 */

Settings = new mongoose.Schema({
  key: { type: String, index: { unique: true } },
  value: mongoose.Schema.Types.Mixed
});

Settings.statics.getValue = function (key, callback) {
  if(!cache.hasOwnProperty(key)) {
    this.findOne({ key: key }, function (err, data) {
      data = data && data.value || undefined;

      if(data) {
        cache[key] = data;
      }

      callback(err, data);
    });
  }
  else {
    callback(null, cache[key]);
  }
};

Settings.statics.setValue = function (key, value, callback) {
  callback = callback || function () {};

  this.update({ key: key }, { value: value }, { upsert: true }, function (err, item) {
    cache[key] = value;
    callback(err, item);
  });
};

module.exports = exports = Settings;


exports.clearCache = function (done) {
  cache = {};
  done();
};

exports.updateCache = function (done) {
  var tempCache = {};

  async.waterfall([
    function (next) {
      mongoose.model('Settings').find({}, next);
    },
    function (items, next) {
      async.each(items, function (item, next) {
        tempCache[item.key] = item.value;
        next();
      }, next);
    }
  ],
  function (err) {
    if(!err) {
      cache = tempCache;
    }

    done(err);
  });
};

exports.clearCacheCron = function (options, callbackEach) {
  var settings = _.extend({
        timeout: 15000,
        aggressive: false
      }, options),
      // On sites with low load it's preferable to just clear the cache.
      // On sites with high load it's preferable to never leave the cache empty
      unCacher = settings.aggressive && exports.updateCache || exports.clearCache;

  callbackEach = callbackEach || function () {};

  function timeout () {
    setTimeout(cron, settings.timeout);
  }

  function cron () {
    unCacher(function (err) {
      callbackEach(err);
      timeout();
    });
  }

  cron();
};

exports.clearCacheCron({}, function (err) {
  if(err) {
    console.warn('Settings cache error:', err);
  }
});
