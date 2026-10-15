const Category = require("../../models/category.model");

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
