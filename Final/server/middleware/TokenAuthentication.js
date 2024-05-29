// middleware function to authenticate and authorize users using JWT tokens
const UserData = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const TokenAuthentication = (req, res, next) => {
  // check if authorization header exists in the request
  if (!req.headers.authorization) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
    // extract token from authorization header
  const token = req.headers.authorization.split(" ")[1];

  // check if token exists
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  // Decode the token
  jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    // Token is invalid or expired
    if (err) return res.status(401).json({ error: "Unauthorized: Invalid token" });

    // retrieve user data based on userId from decoded token
    const user = await UserData.findById(decoded.userId).select("-password");

    // user not found
    if (!user) return res.status(404).json({ error: "User not found" });

    // attach user data to the request object for further processing
    req.user = user;
    next();
  });
};

module.exports = TokenAuthentication; // export the TokenAuthentication function
