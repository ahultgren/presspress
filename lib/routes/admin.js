"use strict";
/**
 * Dashboard
 */
module.exports = function (req, res, next) {
  res.render('admin/index');
};

/**
 * Login form
 */
module.exports.login = function (req, res, next) {
  res.render('admin/login');
};

module.exports.posts = require('./posts');
