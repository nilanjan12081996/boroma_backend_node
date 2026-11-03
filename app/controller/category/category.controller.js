const { Op } = require("sequelize");
const Category = require("../../models/category.model");

// 1. Transport Type Dropdown (e.g. "bus", "car")
exports.getTransportTypes = async (req, res) => {
  try {
    const transportTypes = ["bus", "car"]; // Transport type short names
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
    // Ekhane apnar car type er short_name gulo bosaben
    const carTypes = ["sedan", "suv", "prem-sed", "prem-suv"];
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
    // Ekhane apnar bus type er short_name gulo bosaben
    const busTypes = ["10-15 seater", "15-17 seater", "17-26 seater", "26-33 seater", "33-41 seater", "41-55 seater"];
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
    // Ekhane apnar fuel type er short_name gulo bosaben
    const fuelTypes = ["petrol", "diesel", "cng", "ev"];
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

//5. Bus Model
exports.getBusModel = async (req, res) => {
  try {
    const busModels = ["bharat-benz", "royal-cruiser"];
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
}
//6. Car Model
exports.getCarModel = async (req, res) => {
  try {
    const carModels = ["swift", "dzire", "wagon-r", "innova"];
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
}



exports.createCategory = async (req, res) => {
  try {
    const { category_name, short_name } = req.body;
    if (!category_name || !short_name) {
      return res.status(400).json({
        success: false,
        message: "All fields Are required",
      });
    }
    const categoryData = await Category.create({
      category_name: category_name,
      short_name: short_name,
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

    });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Category.findAll();

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

    await category.update({
      category_name,
      short_name,
    });
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Failed to update Category",
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
