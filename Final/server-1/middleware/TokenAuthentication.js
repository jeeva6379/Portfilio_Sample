const UserData = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const TokenAuthentication = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  // Decode the token
  jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    // Token is invalid or expired
    if (err) return res.status(401).json({ error: "Unauthorized: Invalid token" });

    const user = await UserData.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    req.user = user;
    next();
  });
};

module.exports = TokenAuthentication;
