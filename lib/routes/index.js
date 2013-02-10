"use strict";

exports.index = function (req, res, next) {
  res.render('theme/index');
};

exports.admin = require('./admin');