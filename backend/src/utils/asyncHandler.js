'use strict';

/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express's next() (and therefore to our central errorHandler middleware).
 *
 * Usage: router.post('/route', asyncHandler(myAsyncController))
 *
 * @param {Function} fn - async Express route handler
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
