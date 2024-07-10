// middlewares/authMiddleware.js

function authMiddleware(req, res, next) {
  const isAdminAuthenticated = req.session.admin;
  const isSessionValid = req.session.cookie.expires > Date.now();

  if (isAdminAuthenticated && isSessionValid) {
    res.locals.adminUsername = req.session.adminUsername; // Include admin's username in locals
    next();
  } else if (req.url === "/login" || req.url === "/authenticate") {
    // Allow access to login and authentication routes
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = authMiddleware;
