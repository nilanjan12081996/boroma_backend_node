const fs = require("fs");
const path = require("path");
const VehicleRC = require("../../models/vehicle_rc.model");
const VehicleInfo = require("../../models/vehicle_info.model");

// Helper to collect uploaded file from multer
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

// 1. Create a new Vehicle RC record
exports.createVehicleRC = async (req, res) => {
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

    const rcData = await VehicleRC.create({
      vehical_id,
      document_url: finalDocUrl,
      exp_date: exp_date || null,
      status: req.body.status !== undefined ? Number(req.body.status) : 1, // Automatically set to 1 (Active)
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle RC created successfully",
      data: rcData,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Create Vehicle RC error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle RC",
      error: error.message,
    });
  }
};

// 2. Get all vehicle RC records with optional filters (?vehical_id=...&status=...)
exports.getAllVehicleRC = async (req, res) => {
  try {
    const vehical_id = req.query.vehical_id || req.query.vehicle_id;
    const { status } = req.query;
    const filter = {};

    if (vehical_id) filter.vehical_id = vehical_id;
    if (status !== undefined) filter.status = Number(status);

    const records = await VehicleRC.findAll({
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
      message: "Vehicle RC records fetched successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get all Vehicle RC error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle RC records",
      error: error.message,
    });
  }
};

// 3. Get vehicle RC record by ID
exports.getVehicleRCById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleRC.findByPk(id, {
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
        message: "Vehicle RC record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle RC record fetched successfully",
      data: record,
    });
  } catch (error) {
    console.error("Get Vehicle RC by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle RC record",
      error: error.message,
    });
  }
};

// 4. Get all RC records for a specific vehicle ID
exports.getRCByVehicleId = async (req, res) => {
  try {
    const vehical_id = req.params.vehical_id || req.params.vehicle_id;

    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle found with the provided vehical_id",
      });
    }

    const records = await VehicleRC.findAll({
      where: { vehical_id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle RC records fetched successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get RC records by vehical_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle RC records",
      error: error.message,
    });
  }
};

// 5. Update vehicle RC record
exports.updateVehicleRC = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const { id } = req.params;
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    const record = await VehicleRC.findByPk(id);
    if (!record) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle RC record not found",
      });
    }

    // If vehical_id is provided and changed, verify existence
    if (vehical_id && vehical_id != record.vehical_id) {
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
            console.error("Failed to delete old RC file:", err.message);
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
      exp_date: exp_date !== undefined ? (exp_date || null) : record.exp_date,
      status: status !== undefined ? Number(status) : record.status,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle RC record updated successfully",
      data: record,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Update Vehicle RC error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle RC record",
      error: error.message,
    });
  }
};

// 6. Delete vehicle RC record
exports.deleteVehicleRC = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleRC.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle RC record not found",
      });
    }

    // Delete associated file if it exists in uploads
    if (record.document_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(record.document_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete RC document file:", err.message);
        }
      }
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle RC record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle RC error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle RC record",
      error: error.message,
    });
  }
};

// 7. Toggle RC record status (1 -> 0, 0 -> 1)
exports.toggleVehicleRCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleRC.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle RC record not found",
      });
    }

    const newStatus = record.status === 1 ? 0 : 1;

    await record.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle RC status updated successfully",
      data: {
        id: record.id,
        vehical_id: record.vehical_id,
        status: newStatus,
        updated_at: record.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Vehicle RC status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle RC status",
      error: error.message,
    });
  }
};

