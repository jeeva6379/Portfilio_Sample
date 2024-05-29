// middleware function to restrict access to routes for non-employee users
const EmployeeOnlyAccess = (req, res, next) => {

  // Check if the user's role is "Employee"
  if (req.user.role === "Employee")
        
    // if user is an employee, proceed to the next middleware/route handler
    return next();

  // if user is not an employee, an error message
  res.status(403).json({ error: "Access Denied" });
};

module.exports = EmployeeOnlyAccess; // export the EmployeeOnlyAccess function

