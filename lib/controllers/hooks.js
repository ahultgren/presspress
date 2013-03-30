"use strict";

/**
 * Hooks
 *
 * Controller to create hooks at certain actions and hooking in external functions
 * at those places. For the render controller might register a hook 'prerender'
 * and call do('prerender') before rendering. If a plugin adds a callback on 
 * that action it will be called before every render. If more than one callback
 * has been added, they will be called sequentially.
 */

var async = require('async'),
    hooks = {};

exports.register = function (name, callback) {
  callback = callback || function () {};

  if (!hooks.hasOwnProperty(name)) {
    hooks[name] = [];
    callback(null);
  }
  else {
    callback(new Error('Hook "' + name + '" is already registered'));
  }
};


/**
 * on (hook, [i, ] callback)
 *
 * Add a callback to a hook. 
 *
 * @name string Name of the hook
 * @i integer Position in callback chain to insert the callback
 * @callback function Function to be executed
 */

exports.on = function (name, i, callback) {
  if (arguments.length === 2) {
    callback = i;
    i = undefined;
  }

  if (hooks.hasOwnProperty(name)) {
    if (i !== undefined) {
      hooks[name].splice(i, 0, callback);
    }
    else {
      hooks[name].push(callback);
    }
  }
  else {
    return new Error('Hook "' + name + '" hasn\'t been created yet');
  }
};

exports.do = function (name, data, callback) {
  var methods;

  if (hooks.hasOwnProperty(name)) {
    methods = [function (next) {
      next(null, data);
    }].concat(hooks[name]);

    async.waterfall(methods, callback);
  }
  else {
    callback(new Error('Hook "' + name + '" doesn\'t exist'));
  }
};

//## A way of removing hooks and listeners will be needed
