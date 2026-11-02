const fs = require("fs");
const path = require("path");
const VehiclePermit = require("../../models/vehicle_permit.model");
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

// Create a new Vehicle Permit
exports.createVehiclePermit = async (req, res) => {
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

    const permitData = await VehiclePermit.create({
      vehical_id,
      document_url: finalDocUrl,
      exp_date: exp_date || null,
      status: req.body.status !== undefined ? Number(req.body.status) : 1, // Automatically defaults to 1 (Active) without requiring status from frontend
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle permit created successfully",
      data: permitData,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Create Vehicle Permit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle permit",
      error: error.message,
    });
  }
};

// Get all vehicle permits with optional filters (?vehical_id=...&status=...)
exports.getAllVehiclePermits = async (req, res) => {
  try {
    const vehical_id = req.query.vehical_id || req.query.vehicle_id;
    const { status } = req.query;
    const filter = {};

    if (vehical_id) filter.vehical_id = vehical_id;
    if (status !== undefined) filter.status = Number(status);

    const permits = await VehiclePermit.findAll({
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
      message: "Vehicle permits fetched successfully",
      total: permits.length,
      data: permits,
    });
  } catch (error) {
    console.error("Get all Vehicle Permits error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle permits",
      error: error.message,
    });
  }
};

// Get vehicle permit by ID
exports.getVehiclePermitById = async (req, res) => {
  try {
    const { id } = req.params;
    const permit = await VehiclePermit.findByPk(id, {
      include: [
        {
          model: VehicleInfo,
          as: "vehicle",
        },
      ],
    });

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Vehicle permit not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle permit fetched successfully",
      data: permit,
    });
  } catch (error) {
    console.error("Get Vehicle Permit by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle permit",
      error: error.message,
    });
  }
};

// Get all permits for a specific vehicle ID
exports.getPermitsByVehicleId = async (req, res) => {
  try {
    const vehical_id = req.params.vehical_id || req.params.vehicle_id;

    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle found with the provided vehical_id",
      });
    }

    const permits = await VehiclePermit.findAll({
      where: { vehical_id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle permits fetched successfully",
      total: permits.length,
      data: permits,
    });
  } catch (error) {
    console.error("Get permits by vehical_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle permits",
      error: error.message,
    });
  }
};

// Update vehicle permit
exports.updateVehiclePermit = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const { id } = req.params;
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    const permit = await VehiclePermit.findByPk(id);
    if (!permit) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle permit not found",
      });
    }

    // If vehical_id is provided, verify existence
    if (vehical_id && vehical_id !== permit.vehical_id) {
      const vehicle = await VehicleInfo.findByPk(vehical_id);
      if (!vehicle) {
        deleteUploadedFile(uploadedFile);
        return res.status(404).json({
          success: false,
          message: "Vehicle not found with the provided vehical_id",
        });
      }
    }

    let updatedDocUrl = permit.document_url;
    if (uploadedFile) {
      // Remove old file if it exists locally in uploads
      if (permit.document_url) {
        const oldFilePath = path.join(process.cwd(), "uploads", path.basename(permit.document_url));
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error("Failed to delete old permit file:", err.message);
          }
        }
      }
      updatedDocUrl = uploadedFile.filename;
    } else if (bodyDocUrl !== undefined) {
      updatedDocUrl = bodyDocUrl;
    }

    await permit.update({
      vehical_id: vehical_id !== undefined ? vehical_id : permit.vehical_id,
      document_url: updatedDocUrl,
      exp_date: exp_date !== undefined ? exp_date : permit.exp_date,
      status: status !== undefined ? Number(status) : permit.status,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle permit updated successfully",
      data: permit,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Update Vehicle Permit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle permit",
      error: error.message,
    });
  }
};

// Delete vehicle permit
exports.deleteVehiclePermit = async (req, res) => {
  try {
    const { id } = req.params;
    const permit = await VehiclePermit.findByPk(id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Vehicle permit not found",
      });
    }

    // Delete associated file if it exists in uploads
    if (permit.document_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(permit.document_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete permit document file:", err.message);
        }
      }
    }

    await permit.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle permit deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Permit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle permit",
      error: error.message,
    });
  }
};

// Toggle permit status (1 -> 0, 0 -> 1)
exports.toggleVehiclePermitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const permit = await VehiclePermit.findByPk(id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Vehicle permit not found",
      });
    }

    const newStatus = permit.status === 1 ? 0 : 1;

    await permit.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle permit status updated successfully",
      data: {
        id: permit.id,
        vehical_id: permit.vehical_id,
        status: newStatus,
        updated_at: permit.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Vehicle Permit status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle permit status",
      error: error.message,
    });
  }
};
