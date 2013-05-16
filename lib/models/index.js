"use strict";

var mongoose = require('mongoose');

mongoose.model('Post', require('./Post'));
mongoose.model('User', require('./User'));
mongoose.model('Settings', require('./Settings'));
