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
  },
  {
    // All posts view
    path: '/admin/posts',
    view: 'views/posts/index.jade',
    callbacks: callbacks.posts.create
  },
  {
    // Create post view
    path: '/admin/posts/create',
    view: 'views/posts/single.jade',
    callbacks: callbacks.posts.create
  },
  {
    // Create post POST
    method: 'POST',
    path: '/admin/posts/create',
    callbacks: callbacks.posts.publish
  },
  {
    // Edit post view
    path: '/admin/posts/edit/:id',
    view: 'views/posts/single.jade',
    callbacks: callbacks.posts.edit
  },
  {
    // Edit post POST
    method: 'POST',
    path: '/admin/posts/edit/:id',
    callbacks: callbacks.posts.publish
  },
  {
    // Delete post POST
    method: 'POST',
    path: '/admin/posts/delete/:id',
    callbacks: callbacks.posts.delete
  }
];

exports.pages = [
  {
    title: 'Dashboard',
    path: '/admin'
  },
  {
    title: 'Posts',
    path: '/admin/posts',
    children: [
      {
        title: 'Edit posts',
        path: '/admin/posts'
      },
      {
        title: 'Write post',
        path: '/admin/posts/create'
      }
    ]
  }
];
