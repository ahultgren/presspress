"use strict";

var Reol = require('reol'),
    findByPath = require('findByPath'),
    hooks = require('../hooks'),
    route = require('../route'),
    Page = require('./Page'),
    pages = new Reol({
      parent: { sparse: true }
    });


/* Initalization
============================================================================= */

exports.pages = pages;

hooks.on('hooks.register', function (hooks, next) {
  //## admin.x?
  next();
});

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    //## Check if isAdmin() and set on res.locals to not pollute locals unnecessarily?
    app.locals.adminSidebar = exports.sidebar;
    next();
  });

  next();
});


/* Public methods
============================================================================= */

/**
 * .addPage
 *
 * Add a page to the admin menu
 *
 * @param options (Object)
 *  @param route (Route Object|String) The route to add
 *  @param title (String) Title of the page
 *  @param [menuTitle] (String) Title of the page as seen in the menu
 *  @param [parent] (Page Object) Any parent Page
 *  @param [position] (Integer) For ordering pages
 * @param [callback] (Function) Callback
 *
 * @return (Object) Self for chaining
 */

exports.addPage = function (options, callback) {
  var page, error;

  //## Replace title etc with a labels object à la wp?
  //## Add support for position

  callback = callback || function(){};

  // Support route as path, get a reference to the real route
  if(typeof options.route === 'string') {
    options.route = route.find('path', options.route);
  }

  if(!options.route) {
    error = new Error('No route found');
    callback(error);
    return error;
  }

  page = new Page(options);
  pages.push(page);

  callback(null, page);

  return page;
};


/**
 * .sidebar
 *
 * Render sidebar. Should be available on res.locals
 */

exports.sidebar = function (path) {
  //## Needs to know current url. Expose as locals.currentUrl?
  path = path || this.currentPath;

  return '<ul class="nav nav-pills nav-stacked">' +
    pages.filter({ parent: undefined }).map(function (page) {
      return page.menuLink(path);
    }).join('') +
  '</ul>';
};
