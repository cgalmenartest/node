/**
* Check that the application is running in test mode
*/

module.exports = function user (req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return res.send(403, { message: 'Not Authorized.' });
};
