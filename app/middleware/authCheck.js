const jwt = require("jsonwebtoken");


const authCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied , Token is required",
      });
    }
    
    const token = authHeader.split(" ")[1];

    const decodedAccessToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedAccessToken;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = authCheck;
