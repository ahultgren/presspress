"use strict";

var passport = require('passport'),
    routes = require('../../routes'),
    controllers = require('../index'),
    flow = require('../../utils').flow;

module.exports = [
  {
    // Login
    path: '/admin/login',
    view: 'admin/login.jade',
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
    view: 'admin/index.jade',
    callbacks: routes.admin
  },
  {
    // Create post view
    path: '/admin/posts/create',
    view: 'admin/posts/single.jade',
    callbacks: routes.admin.posts.create
  },
  {
    // Create post POST
    method: 'POST',
    path: '/admin/posts/create',
    callbacks: routes.admin.posts.publish
  },
  {
    // Edit post view
    path: '/admin/posts/edit/:id',
    view: 'admin/posts/single.jade',
    callbacks: routes.admin.posts.edit
  },
  {
    // Edit post POST
    method: 'POST',
    path: '/admin/posts/edit/:id',
    callbacks: routes.admin.posts.publish
  },
  {
    // Delete post POST
    method: 'POST',
    path: '/admin/posts/delete/:id',
    callbacks: routes.admin.posts.delete
  }
];
