"use strict";

var mongoose = require('mongoose');


exports.Post = mongoose.model('Post', require('./Post'));
exports.User = mongoose.model('User', require('./User'));
exports.Settings = mongoose.model('Settings', require('./Settings'));
exports.Media = mongoose.model('Media', require('./Media'));
