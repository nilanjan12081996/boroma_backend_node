const VehicleImage = require("../../models/vehicle_image.model");
const VehicleInfo = require("../../models/vehicle_info.model");

// Create vehicle image
exports.createVehicleImage = async (req, res) => {
  try {
    const { vehicle_id, image, status } = req.body;

    if (!vehicle_id || !image) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id and image are required",
      });
    }

    // Check if vehicle exists
    const vehicle = await VehicleInfo.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found with the provided vehicle_id",
      });
    }

    const vehicleImageData = await VehicleImage.create({
      vehicle_id,
      image,
      status: status !== undefined ? status : 1,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle image created successfully",
      data: vehicleImageData,
    });
  } catch (error) {
    console.error("Create vehicle image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle image",
      error: error.message,
    });
  }
};

// Get all vehicle images (supports optional ?vehicle_id= query filter)
exports.getAllVehicleImages = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    const filter = {};

    if (vehicle_id) {
      filter.vehicle_id = vehicle_id;
    }

    const images = await VehicleImage.findAll({
      where: filter,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle images fetched successfully",
      data: images,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle images",
      error: error.message,
    });
  }
};

// Get images by vehicle_id
exports.getImagesByVehicleId = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const images = await VehicleImage.findAll({
      where: { vehicle_id },
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle images fetched successfully",
      data: images,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle images",
      error: error.message,
    });
  }
};

// Get vehicle image by ID
exports.getVehicleImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleImage = await VehicleImage.findByPk(id);

    if (!vehicleImage) {
      return res.status(404).json({
        success: false,
        message: "Vehicle image not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle image fetched successfully",
      data: vehicleImage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle image",
      error: error.message,
    });
  }
};

// Update vehicle image
exports.updateVehicleImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_id, image, status } = req.body;

    const vehicleImage = await VehicleImage.findByPk(id);

    if (!vehicleImage) {
      return res.status(404).json({
        success: false,
        message: "Vehicle image not found",
      });
    }

    // If vehicle_id is provided, verify it exists
    if (vehicle_id && vehicle_id !== vehicleImage.vehicle_id) {
      const vehicle = await VehicleInfo.findByPk(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found with the provided vehicle_id",
        });
      }
    }

    await vehicleImage.update({
      vehicle_id: vehicle_id !== undefined ? vehicle_id : vehicleImage.vehicle_id,
      image: image !== undefined ? image : vehicleImage.image,
      status: status !== undefined ? status : vehicleImage.status,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle image updated successfully",
      data: vehicleImage,
    });
  } catch (error) {
    console.error("Update vehicle image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle image",
      error: error.message,
    });
  }
};

// Delete vehicle image
exports.deleteVehicleImage = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleImage = await VehicleImage.findByPk(id);

    if (!vehicleImage) {
      return res.status(404).json({
        success: false,
        message: "Vehicle image not found",
      });
    }

    await vehicleImage.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle image",
      error: error.message,
    });
  }
};

// Toggle status (Active / Inactive)
exports.toggleVehicleImageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleImage = await VehicleImage.findByPk(id);

    if (!vehicleImage) {
      return res.status(404).json({
        success: false,
        message: "Vehicle image not found",
      });
    }

    const newStatus = vehicleImage.status === 1 ? 0 : 1;

    await vehicleImage.update({
      status: newStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle image status updated successfully",
      data: {
        id: vehicleImage.id,
        vehicle_id: vehicleImage.vehicle_id,
        image: vehicleImage.image,
        status: vehicleImage.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle image status",
      error: error.message,
    });
  }
};
