const { Op } = require("sequelize");
const Category = require("../../models/category.model");
const { sequelize } = require("../../config/db");

// Fixed allowed short_name values for Category
const ALLOWED_SHORT_NAMES = [
  "Transport_Type",
  "Car_Type",
  "Bus_Type",
  "Bus_Model",
  "Car_Model",
  "Fuel_Type",
];

exports.ALLOWED_SHORT_NAMES = ALLOWED_SHORT_NAMES;

// 0. Get Allowed Short Names List (for frontend dropdowns/validation)
exports.getAllowedShortNames = async (req, res) => {
  try {
    const dbShortNames = await Category.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("short_name")), "short_name"]],
      raw: true,
    });
    const foundList = dbShortNames.map((r) => r.short_name).filter(Boolean);
    const combined = Array.from(new Set([...ALLOWED_SHORT_NAMES, ...foundList]));
    return res.status(200).json({
      success: true,
      message: "Allowed short names fetched successfully",
      data: combined,
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      message: "Allowed short names fetched successfully",
      data: ALLOWED_SHORT_NAMES,
    });
  }
};

/**
 * Single API to fetch categories short_name wise.
 * The short_name is returned as the key, and its categories as the array value under it.
 * 
 * Examples:
 * 1. GET /api/category/by-short-name
 *    Returns all categories grouped by short_name as keys:
 *    {
 *      "success": true,
 *      "message": "Categories fetched by short name successfully",
 *      "data": {
 *        "Transport_Type": [
 *          { "id": 1, "category_name": "BUS", "short_name": "Transport_Type", "status": 1 },
 *          { "id": 2, "category_name": "CAR", "short_name": "Transport_Type", "status": 1 }
 *        ],
 *        "Car_Type": [ ... ],
 *        "Bus_Type": [ ... ],
 *        ...
 *      }
 *    }
 * 
 * 2. GET /api/category/by-short-name/Transport_Type (or ?short_name=Transport_Type)
 *    Returns categories for only that short_name:
 *    {
 *      "success": true,
 *      "message": "Categories for Transport_Type fetched successfully",
 *      "data": {
 *        "Transport_Type": [
 *          { "id": 1, "category_name": "BUS", "short_name": "Transport_Type", "status": 1 },
 *          { "id": 2, "category_name": "CAR", "short_name": "Transport_Type", "status": 1 }
 *        ]
 *      }
 *    }
 */
exports.getCategoriesByShortName = async (req, res) => {
  try {
    const rawShortName = req.params.short_name || req.query.short_name;
    const status = req.query.status !== undefined ? parseInt(req.query.status, 10) : 1;

    const where = {};
    if (!isNaN(status)) {
      where.status = status;
    }

    if (rawShortName) {
      const matched = ALLOWED_SHORT_NAMES.find(
        (name) => name.toLowerCase() === rawShortName.toString().trim().toLowerCase()
      );
      const targetShortName = matched || rawShortName.toString().trim();

      where.short_name = {
        [Op.in]: [
          targetShortName,
          targetShortName.toLowerCase(),
          targetShortName.toUpperCase(),
          rawShortName.toString().trim(),
        ],
      };
    }

    const categories = await Category.findAll({
      where,
      attributes: ["id", "category_name", "short_name", "status"],
      order: [
        ["short_name", "ASC"],
        ["category_name", "ASC"],
      ],
    });

    const groupedData = {};

    if (rawShortName) {
      const matched = ALLOWED_SHORT_NAMES.find(
        (name) => name.toLowerCase() === rawShortName.toString().trim().toLowerCase()
      );
      const keyName = matched || rawShortName.toString().trim();
      groupedData[keyName] = [];
    }

    categories.forEach((cat) => {
      const matchedKey = ALLOWED_SHORT_NAMES.find(
        (name) => name.toLowerCase() === (cat.short_name || "").toLowerCase()
      );
      const key = matchedKey || cat.short_name || "other";

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push({
        id: cat.id,
        category_name: cat.category_name,
        short_name: cat.short_name,
        status: cat.status,
      });
    });

    return res.status(200).json({
      success: true,
      message: rawShortName
        ? `Categories for ${rawShortName} fetched successfully`
        : "Categories fetched by short name successfully",
      data: groupedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories by short name",
      error: error.message,
    });
  }
};

/*
// =========================================================================
// OLD INDIVIDUAL DROPDOWN CONTROLLERS (COMMENTED OUT AS PER REQUIREMENT)
// Replaced by single unified API: getCategoriesByShortName
// =========================================================================

// 1. Transport Type Dropdown (e.g. "bus", "car")
exports.getTransportTypes = async (req, res) => {
  try {
    const transportTypes = ["Transport_Type", "transport_type", "bus", "car"]; // Transport type short names
    const data = await Category.findAll({
      where: {
        short_name: {
          [Op.in]: transportTypes,
        },
        status: 1, // Dropdown er jonno shudhu active items
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Transport types fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transport types",
      error: error.message,
    });
  }
};

// 2. Car Type Dropdown
exports.getCarTypes = async (req, res) => {
  try {
    const carTypes = ["Car_Type", "car_type", "sedan", "suv", "prem-sed", "prem-suv"];
    const data = await Category.findAll({
      where: {
        short_name: {
          [Op.in]: carTypes,
        },
        status: 1,
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Car types fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch car types",
      error: error.message,
    });
  }
};

// 3. Bus Type Dropdown
exports.getBusTypes = async (req, res) => {
  try {
    const busTypes = [
      "Bus_Type",
      "bus_type",
      "10-15 seater",
      "15-17 seater",
      "17-26 seater",
      "26-33 seater",
      "33-41 seater",
      "41-55 seater",
    ];
    const data = await Category.findAll({
      where: {
        short_name: {
          [Op.in]: busTypes,
        },
        status: 1,
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Bus types fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus types",
      error: error.message,
    });
  }
};

// 4. Fuel Type Dropdown
exports.getFuelTypes = async (req, res) => {
  try {
    const fuelTypes = ["Fuel_Type", "fuel_type", "petrol", "diesel", "cng", "ev"];
    const data = await Category.findAll({
      where: {
        short_name: {
          [Op.in]: fuelTypes,
        },
        status: 1,
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Fuel types fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fuel types",
      error: error.message,
    });
  }
};

// 5. Bus Model Dropdown
exports.getBusModel = async (req, res) => {
  try {
    const busModels = ["Bus_Model", "bus_model", "bharat-benz", "royal-cruiser"];
    const data = await Category.findAll({
      where: {
        short_name: {
          [Op.in]: busModels,
        },
        status: 1, // Dropdown er jonno shudhu active items
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Bus models fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus models",
      error: error.message,
    });
  }
};

// 6. Car Model Dropdown
exports.getCarModel = async (req, res) => {
  try {
    const carModels = ["Car_Model", "car_model", "swift", "dzire", "wagon-r", "innova"];
    const data = await Category.findAll({
      where: {
        short_name: {
          [Op.in]: carModels,
        },
        status: 1, // Dropdown er jonno shudhu active items
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Car models fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch car models",
      error: error.message,
    });
  }
};

// 7. Frequency Type Dropdown
exports.getFrequencyTypes = async (req, res) => {
  try {
    const data = await Category.findAll({
      where: {
        short_name: "frequency_type",
        status: 1,
      },
      attributes: ["id", "category_name", "short_name"],
      order: [["category_name", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Frequency types fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch frequency types",
      error: error.message,
    });
  }
};
*/

exports.createCategory = async (req, res) => {
  try {
    const { category_name, short_name } = req.body;
    if (!category_name || !short_name) {
      return res.status(400).json({
        success: false,
        message: "All fields Are required",
      });
    }

    const matchedShortName = ALLOWED_SHORT_NAMES.find(
      (name) => name.toLowerCase() === short_name.toString().trim().toLowerCase()
    );
    const finalShortName = matchedShortName || short_name.toString().trim();

    const categoryData = await Category.create({
      category_name: category_name.trim(),
      short_name: finalShortName,
      status: 1,
    });
    return res.status(200).json({
      success: true,
      message: "Category created Successfully",
      data: categoryData,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const { short_name, status } = req.query;
    const where = {};
    if (short_name) {
      const matchedShortName = ALLOWED_SHORT_NAMES.find(
        (name) => name.toLowerCase() === short_name.toString().trim().toLowerCase()
      );
      where.short_name = matchedShortName || short_name.toString().trim();
    }
    if (status !== undefined) {
      where.status = parseInt(status, 10);
    }

    const categories = await Category.findAll({ where });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const categories = await Category.findByPk(req.params.id);

    if (!categories) {
      return res.status(400).json({
        success: false,
        message: "Category Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, short_name } = req.body;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updateData = {};
    if (category_name !== undefined) {
      updateData.category_name = category_name.trim();
    }
    if (short_name !== undefined) {
      const matchedShortName = ALLOWED_SHORT_NAMES.find(
        (name) => name.toLowerCase() === short_name.toString().trim().toLowerCase()
      );
      updateData.short_name = matchedShortName || short_name.toString().trim();
    }

    await category.update(updateData);
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update Category",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    await category.destroy();
    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

exports.toggleCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    const newStatus = category.status === 1 ? 0 : 1;

    await category.update({
      status: newStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Category status updated Successfully",
      data: {
        id: category.id,
        category_name: category.category_name,
        status: category.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle category status",
      error: error.message,
    });
  }
};
