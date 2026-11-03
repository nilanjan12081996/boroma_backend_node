const fs = require("fs");
const path = require("path");
const VehicleFitness = require("../../models/vehicle_fitness.model");
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

// Helper to safely delete file from uploads
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

// 1. Create a new Vehicle Fitness record
exports.createVehicleFitness = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, document_url: bodyDocUrl } = req.body;

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

    const fitnessData = await VehicleFitness.create({
      vehical_id,
      document_url: finalDocUrl,
      exp_date: exp_date || null,
      status: req.body.status !== undefined ? Number(req.body.status) : 1, // Automatically set to 1 (Active) without needing status from frontend
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle fitness created successfully",
      data: fitnessData,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Create Vehicle Fitness error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle fitness",
      error: error.message,
    });
  }
};

// 2. Get all vehicle fitness records with optional filters (?vehical_id=...&status=...)
exports.getAllVehicleFitness = async (req, res) => {
  try {
    const vehical_id = req.query.vehical_id || req.query.vehicle_id;
    const { status } = req.query;
    const filter = {};

    if (vehical_id) filter.vehical_id = vehical_id;
    if (status !== undefined) filter.status = Number(status);

    const records = await VehicleFitness.findAll({
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
      message: "Vehicle fitness records fetched successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get all Vehicle Fitness error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle fitness records",
      error: error.message,
    });
  }
};

// 3. Get vehicle fitness record by ID
exports.getVehicleFitnessById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleFitness.findByPk(id, {
      include: [
        {
          model: VehicleInfo,
          as: "vehicle",
        },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle fitness record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle fitness record fetched successfully",
      data: record,
    });
  } catch (error) {
    console.error("Get Vehicle Fitness by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle fitness record",
      error: error.message,
    });
  }
};

// 4. Get all fitness records for a specific vehicle ID
exports.getFitnessByVehicleId = async (req, res) => {
  try {
    const vehical_id = req.params.vehical_id || req.params.vehicle_id;

    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle found with the provided vehical_id",
      });
    }

    const records = await VehicleFitness.findAll({
      where: { vehical_id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle fitness records fetched successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get fitness records by vehical_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle fitness records",
      error: error.message,
    });
  }
};

// 5. Update vehicle fitness record
exports.updateVehicleFitness = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const { id } = req.params;
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    const record = await VehicleFitness.findByPk(id);
    if (!record) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle fitness record not found",
      });
    }

    // If vehical_id is provided, verify existence
    if (vehical_id && vehical_id !== record.vehical_id) {
      const vehicle = await VehicleInfo.findByPk(vehical_id);
      if (!vehicle) {
        deleteUploadedFile(uploadedFile);
        return res.status(404).json({
          success: false,
          message: "Vehicle not found with the provided vehical_id",
        });
      }
    }

    let updatedDocUrl = record.document_url;
    if (uploadedFile) {
      // Remove old file if it exists locally in uploads
      if (record.document_url) {
        const oldFilePath = path.join(process.cwd(), "uploads", path.basename(record.document_url));
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error("Failed to delete old fitness file:", err.message);
          }
        }
      }
      updatedDocUrl = uploadedFile.filename;
    } else if (bodyDocUrl !== undefined) {
      updatedDocUrl = bodyDocUrl;
    }

    await record.update({
      vehical_id: vehical_id !== undefined ? vehical_id : record.vehical_id,
      document_url: updatedDocUrl,
      exp_date: exp_date !== undefined ? exp_date : record.exp_date,
      status: status !== undefined ? Number(status) : record.status,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle fitness record updated successfully",
      data: record,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Update Vehicle Fitness error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle fitness record",
      error: error.message,
    });
  }
};

// 6. Delete vehicle fitness record
exports.deleteVehicleFitness = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleFitness.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle fitness record not found",
      });
    }

    // Delete associated file if it exists in uploads
    if (record.document_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(record.document_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete fitness document file:", err.message);
        }
      }
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle fitness record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Fitness error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle fitness record",
      error: error.message,
    });
  }
};

// 7. Toggle fitness record status (1 -> 0, 0 -> 1)
exports.toggleVehicleFitnessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleFitness.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle fitness record not found",
      });
    }

    const newStatus = record.status === 1 ? 0 : 1;

    await record.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle fitness status updated successfully",
      data: {
        id: record.id,
        vehical_id: record.vehical_id,
        status: newStatus,
        updated_at: record.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Vehicle Fitness status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle fitness status",
      error: error.message,
    });
  }
};

