const UserModel = require("../users/schema");
const { APIError } = require("../../utils");
const { verifyJWT } = require("./index");

const authorize = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyJWT(token);
    const user = await UserModel.findById(decoded._id);
    if (!user) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    next(new APIError(401, "Please authenticate"));
  }
};

const adminOnlyMiddleware = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new APIError(403, "Unauthorized"));
  }
};

module.exports = {
  authorize,
  adminOnly: adminOnlyMiddleware,
};
