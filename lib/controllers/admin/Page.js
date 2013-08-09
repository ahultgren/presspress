"use strict";

var crypto = require('crypto'),
    Reol = require('reol'),
    pages = require('./index'),
    Page;


module.exports = exports = Page = function Page (settings) {
  this.title = settings.title;
  this.menuTitle = settings.menuTitle || settings.title;

  this.parent = settings.parent;
  this.route = settings.route;

  this._id = crypto.pseudoRandomBytes(9).toString('base64');
};


Page.prototype.menuLink = function(currentPath) {
  var children = pages.pages.find({ parent: this }).map(function (child) {
        return child.menuLink(currentPath);
      }),
      isCurrent = this.isCurrent(currentPath),
      classnames = [];

  if(isCurrent) {
    classnames.push(isCurrent);
  }
  if(children.length) {
    classnames.push('dropdown-submenu');
  }

  //## Replace this with a template-file eventually
  return '<li class="' + classnames.join(' ') + '">' +
    '<a href="' + this.url() + '">' + this.menuTitle + '</a>' +
    (children.length ?
      ('<ul class="dropdown-menu">' +
        children.join('') +
      '</ul>') : '') +
  '</li>';
};


Page.prototype.url = function() {
  /*global presspress:true*/
  return presspress.app.set('site-url') + this.route.path;
};


Page.prototype.isCurrent = function(currentPath) {
  return this.route.match(currentPath) && 'active' ||
    pages.pages.find({ parent: this }).filter(function (child) {
      return child.isCurrent(currentPath);
    }).length && ' active activeParent' ||
    '';
};


Page.prototype.toString = function() {
  // Support indexing by Reol
  return this._id;
};
