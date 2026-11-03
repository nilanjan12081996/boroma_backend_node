const { Op } = require("sequelize");
const CategoryVehicalMap = require("../../models/category_vehical_map.model");
const Category = require("../../models/category.model");
const VehicleInfo = require("../../models/vehicle_info.model");
const VehicleImage = require("../../models/vehicle_image.model");

// Helper to format vehicle with complete categories and images info
const formatVehicleDetails = (vehicle, req) => {
  const json = vehicle.toJSON ? vehicle.toJSON() : vehicle;
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const formattedImages = (json.images || []).map((img) => {
    const rawImage = img.image || "";
    const cleanFilename = rawImage.replace(/^.*[/\\]/, "");
    return {
      id: img.id,
      image: rawImage,
      image_url: cleanFilename ? `${baseUrl}/uploads/${cleanFilename}` : null,
      status: img.status,
    };
  });

  const formattedCategories = (json.categories || []).map((cat) => ({
    id: cat.id,
    [cat.short_name || "category_name"]: cat.category_name,
    short_name: cat.short_name,
    status: cat.status,
    mapping_id: cat.CategoryVehicalMap ? cat.CategoryVehicalMap.id : null,
    map_status: cat.CategoryVehicalMap ? cat.CategoryVehicalMap.status : 1,
  }));

  return {
    id: json.id,
    vehicle_no: json.vehicle_no,
    no_of_seat: json.no_of_seat,
    status: json.status,
    total_categories: formattedCategories.length,
    categories: formattedCategories,
    total_images: formattedImages.length,
    images: formattedImages,
  };
};

// Create mapping for vehicle and multiple categories
exports.createCategoryVehicleMap = async (req, res) => {
  try {
    const vehicle_id = req.body.vehicle_id || req.body.vehical_id;
    const rawCategoryIds =
      req.body.category_id || req.body.category_ids || req.body.categories;
    const { status, replace } = req.body;

    // 1. Validate vehicle_id
    if (!vehicle_id) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id is required",
      });
    }

    // 2. Validate category_id presence
    if (!rawCategoryIds) {
      return res.status(400).json({
        success: false,
        message: "category_id is required (e.g. [2, 3, 4, 5] or '2,3,4,5')",
      });
    }

    // 3. Normalize category_id into an array of unique positive numbers
    let categoryArray = [];
    if (Array.isArray(rawCategoryIds)) {
      categoryArray = rawCategoryIds;
    } else if (typeof rawCategoryIds === "string") {
      categoryArray = rawCategoryIds.split(",").map((id) => id.trim());
    } else {
      categoryArray = [rawCategoryIds];
    }

    categoryArray = [
      ...new Set(
        categoryArray
          .map((id) => Number(id))
          .filter((id) => !isNaN(id) && id > 0)
      ),
    ];

    if (categoryArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid positive category_id is required",
      });
    }

    // 4. Verify vehicle exists
    const vehicle = await VehicleInfo.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found with the provided vehicle_id",
      });
    }

    // 5. Verify which categories exist in database
    const existingCategories = await Category.findAll({
      where: { id: categoryArray },
    });

    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "None of the provided category_id were found in the database",
      });
    }

    const validCategoryIds = existingCategories.map((c) => Number(c.id));
    const missingCategoryIds = categoryArray.filter(
      (id) => !validCategoryIds.includes(id)
    );

    // 6. Handle Replace mode (if replace: true, remove previous mappings for this vehicle)
    if (replace === true) {
      await CategoryVehicalMap.destroy({
        where: { vehicle_id },
      });

      const recordsToCreate = validCategoryIds.map((catId) => ({
        vehicle_id,
        category_id: catId,
        status: status !== undefined ? Number(status) : 1,
      }));

      const createdMappings = await CategoryVehicalMap.bulkCreate(
        recordsToCreate
      );

      return res.status(201).json({
        success: true,
        message: "Vehicle categories replaced and mapped successfully",
        created_count: createdMappings.length,
        missing_category_ids: missingCategoryIds,
        data: createdMappings,
      });
    }

    // 7. Check for already mapped categories to prevent duplicate active records
    const existingMappings = await CategoryVehicalMap.findAll({
      where: {
        vehicle_id,
        category_id: validCategoryIds,
      },
    });

    const alreadyMappedCategoryIds = existingMappings.map((m) =>
      Number(m.category_id)
    );

    const newCategoryIds = validCategoryIds.filter(
      (id) => !alreadyMappedCategoryIds.includes(id)
    );

    if (newCategoryIds.length === 0) {
      return res.status(409).json({
        success: false,
        message: "All provided categories are already mapped to this vehicle",
        already_mapped_category_ids: alreadyMappedCategoryIds,
        missing_category_ids: missingCategoryIds,
      });
    }

    // 8. Bulk insert new category-vehicle mappings
    const recordsToCreate = newCategoryIds.map((catId) => ({
      vehicle_id,
      category_id: catId,
      status: status !== undefined ? Number(status) : 1,
    }));

    const createdMappings = await CategoryVehicalMap.bulkCreate(recordsToCreate);

    return res.status(201).json({
      success: true,
      message: "Vehicle and categories mapped successfully",
      created_count: createdMappings.length,
      already_mapped_category_ids: alreadyMappedCategoryIds,
      missing_category_ids: missingCategoryIds,
      data: createdMappings,
    });
  } catch (error) {
    console.error("Create CategoryVehicleMap error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to map category and vehicle",
      error: error.message,
    });
  }
};

// Get all mappings (supports ?vehicle_id=, ?category_id=, ?status= query filters)
exports.getAllCategoryVehicleMaps = async (req, res) => {
  try {
    const { vehicle_id, vehical_id, category_id, status } = req.query;
    const filter = {};

    const vId = vehicle_id || vehical_id;
    if (vId) filter.vehicle_id = vId;
    if (category_id) filter.category_id = category_id;
    if (status !== undefined) filter.status = Number(status);

    const mappings = await CategoryVehicalMap.findAll({
      where: filter,
      include: [
        { model: Category, as: "category" },
        { model: VehicleInfo, as: "vehicle" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Category vehicle mappings fetched successfully",
      total: mappings.length,
      data: mappings,
    });
  } catch (error) {
    console.error("Get all CategoryVehicleMap error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mappings",
      error: error.message,
    });
  }
};

// Get all categories mapped to a specific vehicle
exports.getCategoriesByVehicleId = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const mappings = await CategoryVehicalMap.findAll({
      where: { vehicle_id: vehicle_id },
      include: [{ model: Category, as: "category" }],
    });

    return res.status(200).json({
      success: true,
      message: "Categories for vehicle fetched successfully",
      total: mappings.length,
      data: mappings,
    });
  } catch (error) {
    console.error("Get categories by vehicle_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories for vehicle",
      error: error.message,
    });
  }
};

// Get all vehicles mapped to a specific category
exports.getVehiclesByCategoryId = async (req, res) => {
  try {
    const { category_id } = req.params;

    const mappings = await CategoryVehicalMap.findAll({
      where: { category_id },
      include: [{ model: VehicleInfo, as: "vehicle" }],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicles for category fetched successfully",
      total: mappings.length,
      data: mappings,
    });
  } catch (error) {
    console.error("Get vehicles by category_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles for category",
      error: error.message,
    });
  }
};

// Get single mapping by ID
exports.getCategoryVehicleMapById = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CategoryVehicalMap.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: VehicleInfo, as: "vehicle" },
      ],
    });

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Category vehicle mapping not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mapping fetched successfully",
      data: mapping,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mapping",
      error: error.message,
    });
  }
};

// Delete single mapping by ID
exports.deleteCategoryVehicleMap = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CategoryVehicalMap.findByPk(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    await mapping.destroy();

    return res.status(200).json({
      success: true,
      message: "Mapping deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete mapping",
      error: error.message,
    });
  }
};

// Unmap categories from a vehicle (optionally specify category_id in body to delete specific one, or delete all if none specified)
exports.removeCategoriesFromVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const { category_id, category_ids } = req.body;

    const filter = { vehicle_id: vehicle_id };

    const targetCategories = category_id || category_ids;
    if (targetCategories) {
      const catList = Array.isArray(targetCategories)
        ? targetCategories
        : [targetCategories];
      filter.category_id = catList;
    }

    const deletedCount = await CategoryVehicalMap.destroy({
      where: filter,
    });

    return res.status(200).json({
      success: true,
      message: `${deletedCount} mapping(s) removed successfully`,
      deleted_count: deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove mappings",
      error: error.message,
    });
  }
};

// Toggle mapping status (Active / Inactive)
exports.toggleCategoryVehicleMapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CategoryVehicalMap.findByPk(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    const newStatus = mapping.status === 1 ? 0 : 1;

    await mapping.update({
      status: newStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Mapping status updated successfully",
      data: {
        id: mapping.id,
        vehicle_id: mapping.vehicle_id,
        category_id: mapping.category_id,
        status: mapping.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle status",
      error: error.message,
    });
  }
};

// Get complete details of a specific vehicle by ID (includes categories and images)
exports.getVehicleFullDetails = async (req, res) => {
  try {
    const vehicle_id =
      req.params.vehicle_id || req.params.id || req.query.vehicle_id;

    if (!vehicle_id) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id is required",
      });
    }

    const vehicle = await VehicleInfo.findByPk(vehicle_id, {
      include: [
        {
          model: Category,
          as: "categories",
          through: { attributes: ["id", "status"] },
        },
        {
          model: VehicleImage,
          as: "images",
          attributes: ["id", "image", "status"],
        },
      ],
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found with the provided vehicle_id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle details fetched successfully",
      data: formatVehicleDetails(vehicle, req),
    });
  } catch (error) {
    console.error("Get vehicle full details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle details",
      error: error.message,
    });
  }
};

// Listing API: Get all vehicles with complete details (categories & images)
// Supports optional filters: ?search= (vehicle_no), ?category_id=, ?status=, ?vehicle_id=
exports.getAllVehiclesFullDetails = async (req, res) => {
  try {
    const { search, category_id, status, vehicle_id } = req.query;

    // If vehicle_id is provided in query, return single vehicle details
    if (vehicle_id) {
      return exports.getVehicleFullDetails(req, res);
    }

    const where = {};
    if (status !== undefined) {
      where.status = Number(status);
    }
    if (search) {
      where.vehicle_no = { [Op.like]: `%${search.trim()}%` };
    }

    const categoryInclude = {
      model: Category,
      as: "categories",
      through: { attributes: ["id", "status"] },
    };

    if (category_id) {
      categoryInclude.where = { id: category_id };
    }

    const vehicles = await VehicleInfo.findAll({
      where,
      include: [
        categoryInclude,
        {
          model: VehicleImage,
          as: "images",
          attributes: ["id", "image", "status"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const formattedList = vehicles.map((v) => formatVehicleDetails(v, req));

    return res.status(200).json({
      success: true,
      message: "Vehicles listing fetched successfully",
      total: formattedList.length,
      data: formattedList,
    });
  } catch (error) {
    console.error("Get all vehicles full details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles listing",
      error: error.message,
    });
  }
};

