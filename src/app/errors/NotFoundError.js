module.exports = function NotFoundError(message) {
  this.message = message;
  this.status = 404;
};
