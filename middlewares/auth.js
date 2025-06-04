const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey === "a-string-secret-at-least-256-bits-long") {
    return next();
  }
  res.status(403).json({ error: 'Unauthorized access' });
};

export default adminAuth;