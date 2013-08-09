"use strict";

var admin = require('../admin'),
    Admin;


/**
 * Admin
 *
 * This file contains the theme interface for admin related theme methods.
 * It's separated from Theme mostly for sane-naming-convention reasons.
 */

module.exports = exports = Admin = function Admin (parentTheme) {
  this.parent = parentTheme;
};


/**
 * .addPage
 *
 * Proxy for controllers.admin.addPage
 */

Admin.prototype.addPage = admin.addPage;
