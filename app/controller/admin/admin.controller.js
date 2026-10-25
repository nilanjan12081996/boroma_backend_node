const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin.model");

exports.getAdmins = async (req, res) => {
  try {
    const getAdmin = await Admin.findAll({
      attributes: { exclude: ["password", "otp", "o_auth"] },
    });

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: getAdmin,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: err.message,
    });
  }
};

exports.generateTestToken = async (req, res) => {
  try {
    const role = (req.body && req.body.role) || (req.query && req.query.role) || "SUPERADMIN";
    const email = (req.body && req.body.email) || (req.query && req.query.email) || "admin@boroma.com";
    const id = (req.body && req.body.id) || (req.query && req.query.id) || 1;

    const payload = {
      id: Number(id) || 1,
      email: email,
      role: role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      success: true,
      message: "SUPERADMIN test token generated successfully for frontend & Swagger testing",
      token: token,
      authorization_header: `Bearer ${token}`,
      decoded_payload: {
        ...payload,
        expiresIn: "30 days",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate test token",
      error: error.message,
    });
  }
};

exports.setAdmins = async (req, res) => {
  try {
        
  } catch (error) {
        
  }
};
