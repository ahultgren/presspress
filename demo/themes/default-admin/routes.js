"use strict";

var passport = require('passport'),
    main = require.main.exports,
    callbacks = require('./callbacks'),
    controllers = main.controllers,
    flow = main.utils.flow;

exports.routes = [
  {
    // Login
    path: '/admin/login',
    view: 'views/login.jade',
    callbacks: flow.stop()
  },
  {
    // Login post
    method: 'POST',
    path: '/admin/login',
    callbacks: [passport.authenticate('local'), controllers.auth.localDone, flow.redirect('/admin')]
  },
  {
    // All logged in
    method: 'all',
    path: '/admin*',
    callbacks: [controllers.auth.mustBeLoggedIn(2), flow.redirectIf('statusCode', 303)]
  },
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
