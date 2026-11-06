const fs = require("fs");
const path = require("path");
const VehicleInsurance = require("../../models/vehicle_insurance.model");
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

// 1. Create a new Vehicle Insurance record
exports.createVehicleInsurance = async (req, res) => {
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

    const insuranceData = await VehicleInsurance.create({
      vehical_id,
      document_url: finalDocUrl,
      exp_date: exp_date || null,
      status: req.body.status !== undefined ? Number(req.body.status) : 1, // Automatically set to 1 (Active)
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle insurance created successfully",
      data: insuranceData,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Create Vehicle Insurance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle insurance",
      error: error.message,
    });
  }
};

// 2. Get all vehicle insurance records with optional filters (?vehical_id=...&status=...)
exports.getAllVehicleInsurance = async (req, res) => {
  try {
    const vehical_id = req.query.vehical_id || req.query.vehicle_id;
    const { status } = req.query;
    const filter = {};

    if (vehical_id) filter.vehical_id = vehical_id;
    if (status !== undefined) filter.status = Number(status);

    const records = await VehicleInsurance.findAll({
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
      message: "Vehicle insurance records fetched successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get all Vehicle Insurance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle insurance records",
      error: error.message,
    });
  }
};

// 3. Get vehicle insurance record by ID
exports.getVehicleInsuranceById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleInsurance.findByPk(id, {
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
        message: "Vehicle insurance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle insurance record fetched successfully",
      data: record,
    });
  } catch (error) {
    console.error("Get Vehicle Insurance by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle insurance record",
      error: error.message,
    });
  }
};

// 4. Get all insurance records for a specific vehicle ID
exports.getInsuranceByVehicleId = async (req, res) => {
  try {
    const vehical_id = req.params.vehical_id || req.params.vehicle_id;

    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle found with the provided vehical_id",
      });
    }

    const records = await VehicleInsurance.findAll({
      where: { vehical_id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle insurance records fetched successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get insurance records by vehical_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle insurance records",
      error: error.message,
    });
  }
};

// 5. Update vehicle insurance record
exports.updateVehicleInsurance = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const { id } = req.params;
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    const record = await VehicleInsurance.findByPk(id);
    if (!record) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle insurance record not found",
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
            console.error("Failed to delete old insurance file:", err.message);
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
      message: "Vehicle insurance record updated successfully",
      data: record,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Update Vehicle Insurance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle insurance record",
      error: error.message,
    });
  }
};

// 6. Delete vehicle insurance record
exports.deleteVehicleInsurance = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleInsurance.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle insurance record not found",
      });
    }

    // Delete associated file if it exists in uploads
    if (record.document_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(record.document_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete insurance document file:", err.message);
        }
      }
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle insurance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Insurance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle insurance record",
      error: error.message,
    });
  }
};

// 7. Toggle insurance record status (1 -> 0, 0 -> 1)
exports.toggleVehicleInsuranceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleInsurance.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Vehicle insurance record not found",
      });
    }

    const newStatus = record.status === 1 ? 0 : 1;

    await record.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle insurance status updated successfully",
      data: {
        id: record.id,
        vehical_id: record.vehical_id,
        status: newStatus,
        updated_at: record.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Vehicle Insurance status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle insurance status",
      error: error.message,
    });
  }
};

