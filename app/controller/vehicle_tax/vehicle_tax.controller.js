const fs = require("fs");
const path = require("path");
const VehicleTax = require("../../models/vehicle_tax.model");
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

// Create a new Vehicle Tax record
exports.createVehicleTax = async (req, res) => {
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

    const taxData = await VehicleTax.create({
      vehical_id,
      document_url: finalDocUrl,
      exp_date: exp_date || null,
      status: status !== undefined ? Number(status) : 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle tax created successfully",
      data: taxData,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Create Vehicle Tax error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle tax",
      error: error.message,
    });
  }
};

// Get all vehicle taxes with optional filters (?vehical_id=...&status=...)
exports.getAllVehicleTaxes = async (req, res) => {
  try {
    const vehical_id = req.query.vehical_id || req.query.vehicle_id;
    const { status } = req.query;
    const filter = {};

    if (vehical_id) filter.vehical_id = vehical_id;
    if (status !== undefined) filter.status = Number(status);

    const taxes = await VehicleTax.findAll({
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
      message: "Vehicle taxes fetched successfully",
      total: taxes.length,
      data: taxes,
    });
  } catch (error) {
    console.error("Get all Vehicle Taxes error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle taxes",
      error: error.message,
    });
  }
};

// Get vehicle tax by ID
exports.getVehicleTaxById = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await VehicleTax.findByPk(id, {
      include: [
        {
          model: VehicleInfo,
          as: "vehicle",
        },
      ],
    });

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Vehicle tax not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle tax fetched successfully",
      data: tax,
    });
  } catch (error) {
    console.error("Get Vehicle Tax by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle tax",
      error: error.message,
    });
  }
};

// Get all taxes for a specific vehicle ID
exports.getTaxesByVehicleId = async (req, res) => {
  try {
    const vehical_id = req.params.vehical_id || req.params.vehicle_id;

    const vehicle = await VehicleInfo.findByPk(vehical_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No vehicle found with the provided vehical_id",
      });
    }

    const taxes = await VehicleTax.findAll({
      where: { vehical_id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle taxes fetched successfully",
      total: taxes.length,
      data: taxes,
    });
  } catch (error) {
    console.error("Get taxes by vehical_id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle taxes",
      error: error.message,
    });
  }
};

// Update vehicle tax
exports.updateVehicleTax = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const { id } = req.params;
    const vehical_id = req.body.vehical_id || req.body.vehicle_id;
    const { exp_date, status, document_url: bodyDocUrl } = req.body;

    const tax = await VehicleTax.findByPk(id);
    if (!tax) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: "Vehicle tax not found",
      });
    }

    // If vehical_id is provided, verify existence
    if (vehical_id && vehical_id !== tax.vehical_id) {
      const vehicle = await VehicleInfo.findByPk(vehical_id);
      if (!vehicle) {
        deleteUploadedFile(uploadedFile);
        return res.status(404).json({
          success: false,
          message: "Vehicle not found with the provided vehical_id",
        });
      }
    }

    let updatedDocUrl = tax.document_url;
    if (uploadedFile) {
      // Remove old file if it exists locally in uploads
      if (tax.document_url) {
        const oldFilePath = path.join(process.cwd(), "uploads", path.basename(tax.document_url));
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error("Failed to delete old tax file:", err.message);
          }
        }
      }
      updatedDocUrl = uploadedFile.filename;
    } else if (bodyDocUrl !== undefined) {
      updatedDocUrl = bodyDocUrl;
    }

    await tax.update({
      vehical_id: vehical_id !== undefined ? vehical_id : tax.vehical_id,
      document_url: updatedDocUrl,
      exp_date: exp_date !== undefined ? exp_date : tax.exp_date,
      status: status !== undefined ? Number(status) : tax.status,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle tax updated successfully",
      data: tax,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Update Vehicle Tax error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle tax",
      error: error.message,
    });
  }
};

// Delete vehicle tax
exports.deleteVehicleTax = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await VehicleTax.findByPk(id);

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Vehicle tax not found",
      });
    }

    // Delete associated file if it exists in uploads
    if (tax.document_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(tax.document_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete tax document file:", err.message);
        }
      }
    }

    await tax.destroy();

    return res.status(200).json({
      success: true,
      message: "Vehicle tax deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Tax error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle tax",
      error: error.message,
    });
  }
};

// Toggle tax status (1 -> 0, 0 -> 1)
exports.toggleVehicleTaxStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await VehicleTax.findByPk(id);

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Vehicle tax not found",
      });
    }

    const newStatus = tax.status === 1 ? 0 : 1;

    await tax.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle tax status updated successfully",
      data: {
        id: tax.id,
        vehical_id: tax.vehical_id,
        status: newStatus,
        updated_at: tax.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Vehicle Tax status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle vehicle tax status",
      error: error.message,
    });
  }
};
