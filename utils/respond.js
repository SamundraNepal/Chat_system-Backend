exports.Respond = function (res, statusCode, statusType, statusMessage) {
  res.status(statusCode).json({
    status: statusType,
    message: statusMessage,
  });
};
