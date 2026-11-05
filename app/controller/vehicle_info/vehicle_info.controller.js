const { Op } = require("sequelize");
const VehicleInfo = require("../../models/vehicle_info.model");
const Category = require("../../models/category.model");
const CategoryVehicalMap = require("../../models/category_vehical_map.model");
const mappingController = require("../category_vehical_map/category_vehical_map.controller");

// Helper to collect and resolve all Category IDs for a vehicle
const resolveCategoryIds = async (body) => {
  const allIds = [];

  // 1. Process category_ids (Array, string, or number)
  if (Array.isArray(body.category_ids)) {
    allIds.push(...body.category_ids);
  } else if (typeof body.category_ids === "string") {
    allIds.push(...body.category_ids.split(",").map((s) => s.trim()));
  } else if (body.category_ids) {
    allIds.push(body.category_ids);
  }

  // 2. Process category_id (Array, string, or number)
  if (Array.isArray(body.category_id)) {
    allIds.push(...body.category_id);
  } else if (typeof body.category_id === "string") {
    allIds.push(...body.category_id.split(",").map((s) => s.trim()));
  } else if (body.category_id) {
    allIds.push(body.category_id);
  }

  // 3. Process categories array
  if (Array.isArray(body.categories)) {
    body.categories.forEach((c) => {
      if (typeof c === "object" && c !== null) {
        if (c.id) allIds.push(c.id);
        if (c.category_id) allIds.push(c.category_id);
      } else if (c) {
        allIds.push(c);
      }
    });
  }

  // 4. Auto-resolve IDs from classification keys / names:
  // transport_type, vehicle_type, vehicle_model, fuel_type
  const classificationNames = [
    body.transport_type,
    body.vehicle_type,
    body.vehicle_model,
    body.fuel_type,
  ]
    .filter(Boolean)
    .map((v) => String(v).trim());

  if (classificationNames.length > 0) {
    try {
      const lowerKeys = classificationNames.map((v) => v.toLowerCase());
      const matchedCats = await Category.findAll({
        where: {
          [Op.or]: [
            { short_name: { [Op.in]: lowerKeys } },
            { category_name: { [Op.in]: classificationNames } },
          ],
        },
        attributes: ["id", "short_name", "category_name"],
      });
      matchedCats.forEach((c) => allIds.push(c.id));
    } catch (err) {
      console.warn("Classification lookup error:", err.message);
    }
  }

  return [...new Set(allIds.map(Number).filter((id) => !isNaN(id) && id > 0))];
};

// Create vehicle info
exports.createVehicleInfo = async (req, res) => {
  try {
    const { vehicle_no, no_of_seat, status } = req.body;

    if (!vehicle_no) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number is required",
      });
    }

    // Check if vehicle_no already exists
    const existingVehicle = await VehicleInfo.findOne({
      where: { vehicle_no },
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: "Vehicle with this vehicle number already exists",
      });
    }

    const vehicleData = await VehicleInfo.create({
      vehicle_no,
      no_of_seat: no_of_seat !== undefined ? no_of_seat : null,
      status: status !== undefined ? status : 1,
    });

    // Map all provided categories to the created vehicle
    const validCats = await resolveCategoryIds(req.body);
    if (validCats.length > 0) {
      await CategoryVehicalMap.bulkCreate(
        validCats.map((catId) => ({
          vehicle_id: vehicleData.id,
          category_id: catId,
          status: 1,
        }))
      );
    }

    return res.status(201).json({
      success: true,
      message: "Vehicle info created successfully",
      data: vehicleData,
      mapped_category_ids: validCats,
    });
  } catch (error) {
    console.error("Create vehicle info error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle info",
      error: error.message,
    });
  }
};

// Get all vehicle info (with complete details: categories + images)
exports.getAllVehicleInfo = async (req, res) => {
  return mappingController.getAllVehiclesFullDetails(req, res);
};

// Get vehicle info by ID (with complete details: categories + images)
exports.getVehicleInfoById = async (req, res) => {
  return mappingController.getVehicleFullDetails(req, res);
};

// Update vehicle info
exports.updateVehicleInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_no, no_of_seat, status } = req.body;

    const vehicle = await VehicleInfo.findByPk(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check uniqueness if vehicle_no is updated
    if (vehicle_no && vehicle_no !== vehicle.vehicle_no) {
      const existingVehicle = await VehicleInfo.findOne({
        where: { vehicle_no },
      });

      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          message: "Vehicle number already exists",
        });
      }
    }

    await vehicle.update({
      vehicle_no: vehicle_no !== undefined ? vehicle_no : vehicle.vehicle_no,
      no_of_seat: no_of_seat !== undefined ? no_of_seat : vehicle.no_of_seat,
      status: status !== undefined ? status : vehicle.status,
    });

    // Check if category information was provided
    const hasCategoryInput =
      req.body.category_id !== undefined ||
      req.body.category_ids !== undefined ||
      req.body.categories !== undefined ||
      req.body.transport_type !== undefined ||
      req.body.vehicle_type !== undefined ||
      req.body.vehicle_model !== undefined ||
      req.body.fuel_type !== undefined;

    if (hasCategoryInput) {
      const validCats = await resolveCategoryIds(req.body);
      await CategoryVehicalMap.destroy({ where: { vehicle_id: vehicle.id } });
      if (validCats.length > 0) {
        await CategoryVehicalMap.bulkCreate(
          validCats.map((catId) => ({
            vehicle_id: vehicle.id,
            category_id: catId,
            status: 1,
          }))
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle info updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update vehicle info error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle info",
      error: error.message,
    });
  }
};

// Delete vehicle info
exports.deleteVehicleInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleInfo.findByPk(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Also remove category mappings for this vehicle
    await CategoryVehicalMap.destroy({ where: { vehicle_id: id } });

    await vehicle.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle info deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle info",
      error: error.message,
    });
  }
};

// Toggle status (Active / Inactive)
exports.toggleVehicleInfoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleInfo.findByPk(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const newStatus = vehicle.status === 1 ? 0 : 1;

    await vehicle.update({
      status: newStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle status updated successfully",
      data: {
        id: vehicle.id,
        vehicle_no: vehicle.vehicle_no,
        status: vehicle.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle status",
      error: error.message,
    });
  }
};
