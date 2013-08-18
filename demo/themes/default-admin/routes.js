"use strict";

var passport = require('passport'),
    callbacks = require('./callbacks');

exports.routes = [
  {
    // Dashboard
    path: '/admin',
    view: 'views/index.jade',
    callbacks: callbacks
  }
];

exports.pages = [
  {
    title: 'Dashboard',
    path: '/admin'
  }
];
