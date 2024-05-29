const EmployeeOnlyAccess = (req, res, next) => {
  if (req.user.role === "Employee") return next();

  res.status(403).json({ error: "Access Denied" });
};

module.exports = EmployeeOnlyAccess;
