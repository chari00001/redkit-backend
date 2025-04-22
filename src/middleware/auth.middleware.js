const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

module.exports = (req, res, next) => {
  // Test için her isteğe izin ver
  req.user = {
    id: 3,
    email: "test@test.com",
  };
  next();
};
