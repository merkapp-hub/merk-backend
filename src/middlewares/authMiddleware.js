// const authService = require('@services/authService');

// module.exports = {
//   authenticate: (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     try {
//       const decoded = authService.verifyToken(token);
//       req.user = decoded;
//       next();
//     } catch (error) {
//       return res.status(403).json({ message: 'Invalid token' });
//     }
//   },
// };

const passport = require("passport");
const response = require("../../src/responses");
const jwt = require('jsonwebtoken');
module.exports = (role = []) => {
  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
      if (err) { return response.error(res, err); }
      if (!user) { return response.unAuthorize(res, info); }
      if (role.indexOf(user.type) == -1) { return response.unAuthorize(res, { message: "Invalid token" }); }
      req.user = user;
      next();
    })(req, res, next);
  }
};
