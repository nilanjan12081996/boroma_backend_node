const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { Op } = require("sequelize");
const CompanyOperatorAdmin = require("../../models/company_operator_admin.model");
const { sendOperatorOnboardingEmails } = require("../../services/email/operatorEmail.service");

/**
 * Generate a secure random password
 */
const generateRandomPassword = (length = 10) => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@#$!%*?&";

  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const allChars = upper + lower + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

/**
 * 1. Add / Create Company Operator
 * Body: { name / full_name, email, mobile / phone }
 */
exports.createCompanyOperator = async (req, res) => {
  try {
    const full_name = (req.body.full_name || req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const mobile = (req.body.mobile || req.body.phone || "").trim();

    // Validations
    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: "Name (full_name) is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    // Check duplicate email
    const existingOperator = await CompanyOperatorAdmin.findOne({
      where: { email },
    });

    if (existingOperator) {
      return res.status(409).json({
        success: false,
        message: "Company Operator with this email already exists",
      });
    }

    // Generate random password & hash it
    const randomPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create Company Operator Admin record
    const operator = await CompanyOperatorAdmin.create({
      full_name,
      email,
      mobile,
      password: hashedPassword,
      is_active: 1,
      is_approved: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // =========================================================================
    // SEND ONBOARDING EMAILS (Welcome & Password)
    // Mail-er shob logic alada service e maintain kora hoyeche.
    // Mail bondho korte chaile nicher line-ti comment out kore din:
    // =========================================================================
    const emailStatus = await sendOperatorOnboardingEmails({
      email: operator.email,
      full_name: operator.full_name,
      password: randomPassword,
    });
    // =========================================================================

    const responseData = operator.toJSON();
    delete responseData.password;
    delete responseData.otp;

    return res.status(201).json({
      success: true,
      message: "Company Operator created successfully",
      generated_password: randomPassword,
      email_status: emailStatus,
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating company operator:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create company operator",
      error: error.message,
    });
  }
};

/**
 * 2. Get All Company Operators
 * Query params: ?search=...&is_active=...&is_approved=...&page=...&limit=...
 */
exports.getAllCompanyOperators = async (req, res) => {
  try {
    const { search, is_active, is_approved, page, limit } = req.query;
    const filter = {};

    // Search filter
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      filter[Op.or] = [
        { full_name: { [Op.like]: term } },
        { email: { [Op.like]: term } },
        { mobile: { [Op.like]: term } },
      ];
    }

    // Status filter
    if (is_active !== undefined && is_active !== "" && is_active !== "all") {
      filter.is_active = Number(is_active);
    }

    // Approval filter
    if (is_approved !== undefined && is_approved !== "" && is_approved !== "all") {
      filter.is_approved = Number(is_approved);
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isPaginated = !isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0;
    const offset = isPaginated ? (pageNum - 1) * limitNum : undefined;

    const queryOptions = {
      where: filter,
      attributes: { exclude: ["password", "otp"] },
      order: [["id", "DESC"]],
    };

    if (isPaginated) {
      queryOptions.limit = limitNum;
      queryOptions.offset = offset;
    }

    const { count, rows: operators } = await CompanyOperatorAdmin.findAndCountAll(queryOptions);

    return res.status(200).json({
      success: true,
      message: "Company Operators fetched successfully",
      total: count,
      pagination: isPaginated
        ? {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum),
        }
        : undefined,
      data: operators,
    });
  } catch (error) {
    console.error("Error fetching company operators:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company operators",
      error: error.message,
    });
  }
};

/**
 * 3. Get Company Operator By ID
 * Params: :id
 */
exports.getCompanyOperatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await CompanyOperatorAdmin.findByPk(id, {
      attributes: { exclude: ["password", "otp"] },
    });

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Company Operator not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company Operator fetched successfully",
      data: operator,
    });
  } catch (error) {
    console.error("Error fetching company operator by id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company operator",
      error: error.message,
    });
  }
};

/**
 * 4. Update Company Operator
 * Params: :id
 * Body: { full_name, email, mobile, avatar, status_id, is_active, is_approved, password }
 */
exports.updateCompanyOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await CompanyOperatorAdmin.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Company Operator not found",
      });
    }

    const full_name = req.body.full_name || req.body.name;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : undefined;
    const mobile = req.body.mobile || req.body.phone;
    const avatar = req.body.avatar;
    const status_id = req.body.status_id;
    const is_active = req.body.is_active;
    const is_approved = req.body.is_approved;
    const password = req.body.password;

    const updateFields = {};

    if (full_name !== undefined) {
      updateFields.full_name = full_name.trim();
    }

    if (mobile !== undefined) {
      updateFields.mobile = mobile.trim();
    }

    if (avatar !== undefined) {
      updateFields.avatar = avatar.trim();
    }

    if (status_id !== undefined) {
      updateFields.status_id = status_id;
    }

    if (is_active !== undefined) {
      updateFields.is_active = Number(is_active);
    }

    if (is_approved !== undefined) {
      updateFields.is_approved = Number(is_approved);
    }

    // Check duplicate email if email is changed
    if (email && email !== operator.email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingEmail = await CompanyOperatorAdmin.findOne({
        where: { email },
      });

      if (existingEmail && existingEmail.id !== operator.id) {
        return res.status(409).json({
          success: false,
          message: "Another Company Operator with this email already exists",
        });
      }
      updateFields.email = email;
    }

    // Update password if provided
    if (password && password.trim()) {
      updateFields.password = await bcrypt.hash(password.trim(), 10);
    }

    updateFields.updated_at = new Date();

    await operator.update(updateFields);

    const updatedData = operator.toJSON();
    delete updatedData.password;
    delete updatedData.otp;

    return res.status(200).json({
      success: true,
      message: "Company Operator updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating company operator:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company operator",
      error: error.message,
    });
  }
};

/**
 * 5. Toggle Operator Status (Active 1 <-> Inactive 0)
 * Params: :id
 */
exports.toggleCompanyOperatorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await CompanyOperatorAdmin.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Company Operator not found",
      });
    }

    const newStatus = operator.is_active === 1 ? 0 : 1;
    await operator.update({
      is_active: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Company Operator status set to ${newStatus === 1 ? "Active" : "Inactive"}`,
      data: {
        id: operator.id,
        full_name: operator.full_name,
        is_active: newStatus,
        updated_at: operator.updated_at,
      },
    });
  } catch (error) {
    console.error("Error toggling company operator status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle operator status",
      error: error.message,
    });
  }
};

/**
 * 6. Toggle Operator Approval (Approved 1 <-> Unapproved 0)
 * Params: :id
 */
exports.toggleCompanyOperatorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await CompanyOperatorAdmin.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Company Operator not found",
      });
    }

    const newApproval = operator.is_approved === 1 ? 0 : 1;
    await operator.update({
      is_approved: newApproval,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Company Operator approval set to ${newApproval === 1 ? "Approved" : "Unapproved"}`,
      data: {
        id: operator.id,
        full_name: operator.full_name,
        is_approved: newApproval,
        updated_at: operator.updated_at,
      },
    });
  } catch (error) {
    console.error("Error toggling company operator approval:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle operator approval",
      error: error.message,
    });
  }
};

/**
 * 7. Delete Company Operator
 * Params: :id
 */
exports.deleteCompanyOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await CompanyOperatorAdmin.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Company Operator not found",
      });
    }

    await operator.destroy();

    return res.status(200).json({
      success: true,
      message: "Company Operator deleted successfully",
      deleted_id: Number(id),
    });
  } catch (error) {
    console.error("Error deleting company operator:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete company operator",
      error: error.message,
    });
  }
};







exports.generateRandomPassword = generateRandomPassword;
