const fs = require("fs");
const path = require("path");
const VehiclePollution = require("../../models/vehicle_pollution.model");
const VehicleInfo = require("../../models/vehicle_info.model");

// Helper to collect uploaded file
const getUploadedFile = (req) => {
  if (req.file) return req.file;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const key of Object.keys(req.files)) {
      const item = req.files[key];
      if (Array.isArray(item) && item.length > 0) return item[0];
      if (item) return item;
    }
  }
  return null;
};

// Helper to safely delete file
const deleteUploadedFile = (file) => {
  if (!file) return;
  const filePath = typeof file === "string" ? file : file?.path;
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete file:", err.message);
    }
  }
};

// Create a new Vehicle Pollution record
exports.createVehiclePollution = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    if (!vehical_id) {
      deleteUploadedFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "vehical_id is required",
      });
    }

    // Verify vehicle exists
    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle not found with the provided vehical_id",
      });
    }

    // Resolve document URL from file or body
    let finalDocUrl = null;
    if (uploadedFile) {
      finalDocUrl = uploadedFile.filename;
    } else if (bodyDocUrl) {
      finalDocUrl = bodyDocUrl;
    }

    const pollutionData = await VehiclePollution.create({
      vehical_id,
      document_url: finalDocUrl,
      exp_date: exp_date || null,
      status: status !== undefined ? Number(status) : 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle pollution created successfully",
      data: pollutionData,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Create Vehicle Pollution error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle pollution",
      error: error.message,
    });
  }
};

// Get all vehicle pollutions with optional filters (?vehical_id=...&status=...)
exports.getAllVehiclePollutions = async (req, res) => {
  try {
    const vehical_id = req.query.vehical_id || req.query.vehicle_id;
    const { status } = req.query;
    const filter = {};

    if (vehical_id) filter.vehical_id = vehical_id;
    if (status !== undefined) filter.status = Number(status);

    const pollutions = await VehiclePollution.findAll({
      where: filter,
      include: [
        {
          model: VehicleInfo,
          as: "vehicle",
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle pollutions fetched successfully",
      total: pollutions.length,
      data: pollutions,
    });
  } catch (error) {
    console.error("Get all Vehicle Pollutions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle pollutions",
      error: error.message,
    });
  }
};

// Get vehicle pollution by ID
exports.getVehiclePollutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pollution = await VehiclePollution.findByPk(id, {
      include: [
        {
          model: VehicleInfo,
          as: "vehicle",
        },
      ],
    });

    if (!pollution) {
      return res.status(404).json({
        success: false,
        message: "Vehicle pollution not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle pollution fetched successfully",
      data: pollution,
    });
  } catch (error) {
    console.error("Get Vehicle Pollution by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle pollution",
      error: error.message,
    });
  }
};

// Get all pollutions for a specific vehicle ID
exports.getPollutionsByVehicleId = async (req, res) => {
  try {
    const vehical_id = req.params.vehical_id || req.params.vehicle_id;

    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle found with the provided vehical_id",
      });
    }

    const pollutions = await VehiclePollution.findAll({
      where: { vehical_id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle pollutions fetched successfully",
      total: pollutions.length,
      data: pollutions,
    });
  } catch (error) {
    console.error("Get pollutions by vehical_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle pollutions",
      error: error.message,
    });
  }
};

// Update vehicle pollution
exports.updateVehiclePollution = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const { id } = req.params;
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    const pollution = await VehiclePollution.findByPk(id);
    if (!pollution) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle pollution not found",
      });
    }

    // If vehical_id is provided, verify existence
    if (vehical_id && vehical_id !== pollution.vehical_id) {
      const vehicle = await VehicleInfo.findByPk(vehical_id);
      if (!vehicle) {
        deleteUploadedFile(uploadedFile);
        return res.status(404).json({
          success: false,
          message: "Vehicle not found with the provided vehical_id",
        });
      }
    }

    let updatedDocUrl = pollution.document_url;
    if (uploadedFile) {
      // Remove old file if it exists locally in uploads
      if (pollution.document_url) {
        const oldFilePath = path.join(process.cwd(), "uploads", path.basename(pollution.document_url));
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error("Failed to delete old pollution file:", err.message);
          }
        }
      }
      updatedDocUrl = uploadedFile.filename;
    } else if (bodyDocUrl !== undefined) {
      updatedDocUrl = bodyDocUrl;
    }

    await pollution.update({
      vehical_id: vehical_id !== undefined ? vehical_id : pollution.vehical_id,
      document_url: updatedDocUrl,
      exp_date: exp_date !== undefined ? exp_date : pollution.exp_date,
      status: status !== undefined ? Number(status) : pollution.status,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle pollution updated successfully",
      data: pollution,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Update Vehicle Pollution error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle pollution",
      error: error.message,
    });
  }
};

// Delete vehicle pollution
exports.deleteVehiclePollution = async (req, res) => {
  try {
    const { id } = req.params;
    const pollution = await VehiclePollution.findByPk(id);

    if (!pollution) {
      return res.status(404).json({
        success: false,
        message: "Vehicle pollution not found",
      });
    }

    // Delete associated file if it exists in uploads
    if (pollution.document_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(pollution.document_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete pollution document file:", err.message);
        }
      }
    }

    await pollution.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle pollution deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Pollution error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle pollution",
      error: error.message,
    });
  }
};

// Toggle pollution status 
exports.toggleVehiclePollutionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pollution = await VehiclePollution.findByPk(id);

    if (!pollution) {
      return res.status(404).json({
        success: false,
        message: "Vehicle pollution not found",
      });
    }

    const newStatus = pollution.status === 1 ? 0 : 1;

    await pollution.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle pollution status updated successfully",
      data: {
        id: pollution.id,
        vehical_id: pollution.vehical_id,
        status: newStatus,
        updated_at: pollution.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Vehicle Pollution status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle pollution status",
      error: error.message,
    });
  }
};
