const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Driver = require("../../models/driver.model");
const { Op } = require("sequelize");

// Helper to generate a random password if not supplied
function generateRandomPassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@#$!%*?&";
  
  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += special[Math.floor(Math.random() * special.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  const allChars = upper + lower + numbers + special;
  for (let i = 3; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// 1. Create / Register Driver
exports.createDriver = async (req, res) => {
  try {
    const { driver_name, driver_phone, driver_email, password } = req.body;

    if (!driver_name || !driver_phone) {
      return res.status(400).json({
        success: false,
        message: "driver_name and driver_phone are required",
      });
    }

    // Check duplicate phone
    const existingPhone = await Driver.findOne({ where: { driver_phone } });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Driver with this phone number already exists",
      });
    }

    // Check duplicate email if provided
    if (driver_email) {
      const existingEmail = await Driver.findOne({ where: { driver_email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Driver with this email already exists",
        });
      }
    }

    const rawPassword = password || generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const driver = await Driver.create({
      driver_name,
      driver_phone,
      driver_email: driver_email || null,
      password: hashedPassword,
      status: 0, // Default 0 as requested
      created_at: new Date(),
      updated_at: new Date(),
    });

    const responseData = driver.toJSON();
    delete responseData.password;
    delete responseData.otp;
    delete responseData.otp_exp;

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      generated_password: !password ? rawPassword : undefined,
      data: responseData,
    });
  } catch (error) {
    console.error("Create Driver error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create driver",
      error: error.message,
    });
  }
};

// 2. Get All Drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status !== undefined) filter.status = Number(status);
    if (search) {
      filter[Op.or] = [
        { driver_name: { [Op.like]: `%${search}%` } },
        { driver_phone: { [Op.like]: `%${search}%` } },
        { driver_email: { [Op.like]: `%${search}%` } },
      ];
    }

    const drivers = await Driver.findAll({
      where: filter,
      attributes: { exclude: ["password", "otp", "otp_exp"] },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Drivers fetched successfully",
      total: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error("Get all Drivers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

// 3. Get Driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id, {
      attributes: { exclude: ["password", "otp", "otp_exp"] },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver fetched successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Get Driver by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
      error: error.message,
    });
  }
};

// 4. Update Driver
exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_name, driver_phone, driver_email, password, status } = req.body;

    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Check duplicate phone if being updated
    if (driver_phone && driver_phone !== driver.driver_phone) {
      const existingPhone = await Driver.findOne({ where: { driver_phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Driver with this phone number already exists",
        });
      }
    }

    // Check duplicate email if being updated
    if (driver_email && driver_email !== driver.driver_email) {
      const existingEmail = await Driver.findOne({ where: { driver_email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Driver with this email already exists",
        });
      }
    }

    const updateFields = {
      updated_at: new Date(),
    };

    if (driver_name !== undefined) updateFields.driver_name = driver_name;
    if (driver_phone !== undefined) updateFields.driver_phone = driver_phone;
    if (driver_email !== undefined) updateFields.driver_email = driver_email;
    if (status !== undefined) updateFields.status = Number(status);
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    await driver.update(updateFields);

    const updatedData = driver.toJSON();
    delete updatedData.password;
    delete updatedData.otp;
    delete updatedData.otp_exp;

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Update Driver error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update driver",
      error: error.message,
    });
  }
};

// 5. Toggle Driver Status (Active 1 <-> Inactive 0)
exports.toggleDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const newStatus = driver.status === 1 ? 0 : 1;
    await driver.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Driver status updated successfully",
      data: {
        id: driver.id,
        driver_name: driver.driver_name,
        status: newStatus,
        updated_at: driver.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Driver status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle driver status",
      error: error.message,
    });
  }
};

// 6. Delete Driver
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await driver.destroy();

    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error("Delete Driver error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete driver",
      error: error.message,
    });
  }
};

