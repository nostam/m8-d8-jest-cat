class APIError extends Error {
  constructor(statusCode = 500, message, operational = true) {
    super(message);
    this.httpStatusCode = statusCode;
    this.message = message;
    this.isOperational = operational;
  }
}

const accessTokenOptions = {
  httpOnly: true,
  path: "/",
  overwrite: true,
};

const refreshTokenOptions = {
  httpOnly: true,
  path: "/users/refreshToken",
  overwrite: true,
};

const errorHandler = (err, req, res, next) => {
  if (!res.headersSent) {
    res.status(err.httpStatusCode || 500).send({ message: err.message });
  }
};

module.exports = {
  APIError,
  accessTokenOptions,
  refreshTokenOptions,
  errorHandler,
};
