const VehicleInfo = require("../../models/vehicle_info.model");

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

    return res.status(201).json({
      success: true,
      message: "Vehicle info created successfully",
      data: vehicleData,
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

// Get all vehicle info
exports.getAllVehicleInfo = async (req, res) => {
  try {
    const vehicles = await VehicleInfo.findAll();

    return res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

// Get vehicle info by ID
exports.getVehicleInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleInfo.findByPk(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle",
      error: error.message,
    });
  }
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
