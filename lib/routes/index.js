"use strict";

exports.index = function (req, res, next) {
  res.render('index');
};

exports.admin = require('./admin');