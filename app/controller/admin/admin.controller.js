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

exports.setAdmins = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}
