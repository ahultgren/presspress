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

  return exports;
};


/**
 * on (hook[, i], action)
 *
 * Add an action to a hook. 
 *
 * @param name (string) Name of the hook
 * @param i (integer) Position in action chain to insert the action
 * @param action (function) Function to be executed
 * @param callback (function) Called when done
 */

exports.on = function (name, i, action, callback) {
  callback = callback || function(){};

  if (arguments.length === 2) {
    action = i;
    i = undefined;
  }

  if (hooks.hasOwnProperty(name)) {
    if (i !== undefined) {
      hooks[name].splice(i, 0, action);
    }
    else {
      hooks[name].push(action);
    }

    callback();
  }
  else {
    callback(new Error('Hook "' + name + '" hasn\'t been created yet'));
  }

  return exports;
};

exports.do = function (name, data, callback) {
  var methods;

  // Let callback be optional and potentialy multiple data params
  if(arguments.length > 3) {
    data = Array.prototype.slice.call(arguments, 1);

    callback = typeof data[data.length-1] === 'function' ? data.splice(-1, 1)[0] : undefined;
  }

  if (hooks.hasOwnProperty(name)) {
    methods = hooks[name];

    async.each(methods, function (method, next) {
      method.apply(null, [].concat(data || [], next));
    }, callback);
  }
  else {
    callback(new Error('Hook "' + name + '" doesn\'t exist'));
  }

  return exports;
};

//## A way of removing hooks and listeners will be needed

exports.register('hooks.register').register('hooks.listen');
