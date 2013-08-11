"use strict";

/**
 * This is the admin theme. The goal is that everything in the admin should be
 * customizeable from here. It should be easy to create a new theme and inherit
 * another theme to extend its functionality.
 */

var routes = require('./routes').routes,
    pages = require('./routes').pages;


exports.info = require('./package.json');

exports.install = function (theme, done) {
  theme.registerFolder('./public', '/presspress');

  routes.forEach(addRoute.bind(theme));
  pages.forEach(function (route) {
    addPage.call(theme, route);
  });

  theme.registerPostType('post', {
    labels: {
      singular: 'Post',
      plural: 'Posts',
      'View items': 'View posts',
      'Add item': 'Add post'
    }
  });

  done();
};

function addRoute (route) {
  /*jshint validthis:true*/

  this.addRoute({
    path: route.path,
    view: route.view,
    method: route.method,
    callbacks: route.callbacks
  });
}

function addPage (route, parent) {
  /*jshint validthis:true*/

  var theme = this,
      current = theme.admin.addPage({
        route: route.path,
        title: route.title,
        menuTitle: route.menuTitle,
        parent: parent
      });

  if(!(current instanceof Error) && route.children) {
    route.children.forEach(function (route) {
      addPage.call(theme, route, current);
    });
  }
}
