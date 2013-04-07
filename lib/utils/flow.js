"use strict";

/**
 * flow
 *
 * A library of middleware for making it obivous when the callback chain is
 * stopped just by looking at the route list.
 */


/* Public methods
============================================================================= */

/**
 * flow.stop()
 *
 * Just abort the callback chain and render whatever view and data that has been
 * set to the res object. Useful there's following matches that must not be run.
 */
exports.stop = function () {
  return function (req, res) {
    res.render();
  };
};


/**
 * flow.redirect()
 *
 * Redirect to whatever path with whatever code has been set on the res object,
 * or if those are not set to the default path.
 */
exports.redirect = function (defaultPath) {
  return function (req, res) {
    //## Check that the path is the same host to avoid redirect exploits
    res.redirect(res.statusCode || 303, res.redirectPath || defaultPath);
  };
};


/**
 * flow.redirectIf()
 *
 * Redirect to path with status set on the res object based on whether or not
 * a res property has a certain value.
 *
 * @param property (string|number) Name of property on the res object
 * @param [propery] (string|number) Name of property on the previously
 *  specified object
 * @param value (mixed) Value to compare with
 * @return (function) Middleware
 */

exports.redirectIf = function () {
  var criteria = Array.prototype.slice.call(arguments),
      value = criteria.pop();

  return function (req, res, next) {
    var criterion = res,
        i, l;

    for(i = 0, l = criteria.length; i < l; i++) {
      if(typeof criterion !== 'object') {
        return next();
      }

      criterion = criterion[criteria[i]];
    }

    if(criterion === value) {
      return exports.redirect()(req, res);
    }

    next();
  };
};
