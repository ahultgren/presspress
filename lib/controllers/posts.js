"use strict";
var mongoose = require('mongoose');

exports.create = function (data, callback) {
  mongoose.model('Post').create(data, function (err, post) {
    //## In case alias fails, retry (take a param for auto-retry?)
    if (err) { console.log(err); }

    callback(err, post);
  });
};