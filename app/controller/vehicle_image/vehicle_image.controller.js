const fs = require("fs");
const path = require("path");

const VehicleImage = require("../../models/vehicle_image.model");
const VehicleInfo = require("../../models/vehicle_info.model");

// Helper to collect all uploaded files
const collectUploadedFiles = (req) => {
  const files = [];
  if (req.file) {
    files.push(req.file);
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else if (typeof req.files === "object") {
      Object.values(req.files).forEach((item) => {
        if (Array.isArray(item)) files.push(...item);
        else if (item) files.push(item);
      });
    }
  }
  return files;
};

// Helper to safely delete uploaded files
const deleteFiles = (files) => {
  if (!files) return;
  const list = Array.isArray(files) ? files : [files];
  list.forEach((file) => {
    const filePath = typeof file === "string" ? file : file?.path;
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete file:", err.message);
      }
    }
  });
};

// Create vehicle images

exports.createVehicleImage = async (req, res) => {
  const uploadedFiles = collectUploadedFiles(req);

  try {
    const { vehicle_id } = req.body;

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (!vehicle_id) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({
        success: false,
        message: "vehicle_id required",
      });
    }

    // Check if vehicle exists
    const vehicle = await VehicleInfo.findByPk(vehicle_id);
    if (!vehicle) {
      deleteFiles(uploadedFiles);
      return res.status(404).json({
        success: false,
        message: "Vehicle not found with the provided vehicle_id",
      });
    }

    const recordsToCreate = uploadedFiles.map((file) => ({
      vehicle_id,
      image: file.filename,

    }));

    const vehicleImageData = await VehicleImage.bulkCreate(recordsToCreate);

    return res.status(201).json({
      success: true,
      message:
        uploadedFiles.length > 1
          ? "Vehicle images created successfully"
          : "Vehicle image created successfully",
      data: vehicleImageData,
    });
  } catch (error) {
    deleteFiles(uploadedFiles);
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

    const vehicle = await VehicleInfo.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle has been found against provided vehicle id",
      });
    }

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
  // Collect any uploaded file
  let uploadedFile = null;
  if (req.file) {
    uploadedFile = req.file;
  } else if (Array.isArray(req.files) && req.files.length > 0) {
    uploadedFile = req.files[0];
  } else if (req.files && typeof req.files === "object") {
    const allFiles = [];
    Object.values(req.files).forEach((item) => {
      if (Array.isArray(item)) allFiles.push(...item);
      else if (item) allFiles.push(item);
    });
    if (allFiles.length > 0) uploadedFile = allFiles[0];
  }

  try {
    const { id } = req.params;
    const { vehicle_id, image, status } = req.body;

    const vehicleImage = await VehicleImage.findByPk(id);

    if (!vehicleImage) {
      if (uploadedFile) deleteFiles([uploadedFile]);
      return res.status(404).json({
        success: false,
        message: "Vehicle image not found",
      });
    }

    // If vehicle_id is provided, verify it exists
    if (vehicle_id && vehicle_id !== vehicleImage.vehicle_id) {
      const vehicle = await VehicleInfo.findByPk(vehicle_id);
      if (!vehicle) {
        if (uploadedFile) deleteFiles([uploadedFile]);
        return res.status(404).json({
          success: false,
          message: "Vehicle not found with the provided vehicle_id",
        });
      }
    }

    let updatedImage = vehicleImage.image;
    if (uploadedFile) {
      // Remove old file from uploads if it exists
      if (vehicleImage.image) {
        const oldFilePath = path.join(process.cwd(), "uploads", path.basename(vehicleImage.image));
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error("Failed to delete old image file:", err.message);
          }
        }
      }
      updatedImage = uploadedFile.filename;
    } else if (image !== undefined) {
      updatedImage = image;
    }

    await vehicleImage.update({
      vehicle_id: vehicle_id !== undefined ? vehicle_id : vehicleImage.vehicle_id,
      image: updatedImage,
      status: status !== undefined ? Number(status) : vehicleImage.status,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle image updated successfully",
      data: vehicleImage,
    });
  } catch (error) {
    if (uploadedFile) deleteFiles([uploadedFile]);
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

    // Delete image file from uploads folder if it exists
    if (vehicleImage.image) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(vehicleImage.image));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete image file:", err.message);
        }
      }
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
