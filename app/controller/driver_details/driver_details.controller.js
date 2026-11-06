const fs = require("fs");
const path = require("path");
const DriverDetails = require("../../models/driver_details.model");
const Driver = require("../../models/driver.model");

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

// Normalize doc_type to 'L' (Licence) or 'A' (Aadhaar Card) or 'BK' (Passbook)
const normalizeDocType = (type) => {
  if (!type) return type;
  const s = String(type).trim().toUpperCase();
  if (s === "L" || s === "DRIVING_LICENCE" || s === "LICENCE" || s === "LICENSE") return "L";
  if (s === "A" || s === "AADHAAR_CARD" || s === "AADHAR" || s === "AADHAAR") return "A";
  if (s === "BK" || s === "BANK-PASSBOOK" || s === "PASSBOOK" || s === "PASS-BOOK") return "BK";
  return s;
};

/**
 * 1. Single function for Create & Update
 * - If params.id is provided -> Update existing record
 * - If params.id is NOT provided -> Create new record
 */
exports.saveDriverDetails = async (req, res) => {
  const uploadedFile = getUploadedFile(req);

  try {
    const effectiveId = req.params.id || req.body.id;
    const { driver_id, exp_date, status, doc_url: bodyDocUrl } = req.body;
    const doc_type = normalizeDocType(req.body.doc_type);

    // ==========================================
    // UPDATE OPERATION (id exists in req.params)
    // ==========================================
    if (effectiveId) {
      const record = await DriverDetails.findByPk(effectiveId);
      if (!record) {
        deleteUploadedFile(uploadedFile);
        return res.status(404).json({
          success: false,
          message: `Driver details record with id ${effectiveId} not found`,
        });
      }

      // If driver_id is changed/provided, verify driver exists
      if (driver_id && driver_id != record.driver_id) {
        const driver = await Driver.findByPk(driver_id);
        if (!driver) {
          deleteUploadedFile(uploadedFile);
          return res.status(404).json({
            success: false,
            message: `Driver not found with id ${driver_id}`,
          });
        }
      }

      // Validate doc_type if provided
      if (doc_type && !["L", "A", "BK"].includes(doc_type)) {
        deleteUploadedFile(uploadedFile);
        return res.status(400).json({
          success: false,
          message: "Invalid doc_type. Allowed values are 'L' (Licence) or 'A' (Aadhar Card) or 'BK' (BANK PASSBOOK)",
        });
      }

      // Handle document file upload replacement
      let finalDocUrl = record.doc_url;
      if (uploadedFile) {
        // Delete old file if present locally
        if (record.doc_url) {
          const oldFilePath = path.join(process.cwd(), "uploads", path.basename(record.doc_url));
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.error("Failed to delete old document file:", err.message);
            }
          }
        }
        finalDocUrl = uploadedFile.filename;
      } else if (bodyDocUrl !== undefined) {
        finalDocUrl = bodyDocUrl;
      }

      // Resolve effective doc_type
      const effectiveDocType = doc_type !== undefined ? doc_type : record.doc_type;

      // If doc_type is "A" and "BK" exp_date will always be null
      const finalExpDate =
        effectiveDocType === "A" || effectiveDocType === "BK"
          ? null
          : exp_date !== undefined
            ? exp_date || null
            : record.exp_date;

      await record.update({
        driver_id: driver_id !== undefined ? driver_id : record.driver_id,
        doc_type: effectiveDocType,
        doc_url: finalDocUrl,
        exp_date: finalExpDate,
        status: status !== undefined ? Number(status) : record.status,
        updated_at: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Driver details updated successfully",
        data: record,
      });
    }

    // ==========================================
    // CREATE OPERATION (No id in req.params)
    // ==========================================
    if (!driver_id || !doc_type) {
      deleteUploadedFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "driver_id and doc_type ('L' for Licence, 'A' for Aadhar Card, 'BK' for BANK PASSBOOK ) are required",
      });
    }

    // Validate doc_type
    if (!["L", "A", "BK"].includes(doc_type)) {
      deleteUploadedFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "Invalid doc_type. Allowed values are 'L' (Licence) or 'A' (Aadhar Card) or 'BK' (BANK PASSBOOK)",
      });
    }

    // Check if driver exists
    const driver = await Driver.findByPk(driver_id);
    if (!driver) {
      deleteUploadedFile(uploadedFile);
      return res.status(404).json({
        success: false,
        message: `Driver not found with id ${driver_id}`,
      });
    }

    // Check duplicate document type for same driver: auto-update if already exists
    const existingDoc = await DriverDetails.findOne({
      where: { driver_id, doc_type },
    });
    if (existingDoc) {
      let finalDocUrl = existingDoc.doc_url;
      if (uploadedFile) {
        if (existingDoc.doc_url) {
          const oldFilePath = path.join(process.cwd(), "uploads", path.basename(existingDoc.doc_url));
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.error("Failed to delete old document file:", err.message);
            }
          }
        }
        finalDocUrl = uploadedFile.filename;
      } else if (bodyDocUrl !== undefined) {
        finalDocUrl = bodyDocUrl;
      }

      await existingDoc.update({
        doc_url: finalDocUrl,
        exp_date:
          doc_type === "A" || doc_type === "BK"
            ? null
            : exp_date !== undefined
              ? exp_date || null
              : existingDoc.exp_date,
        status: status !== undefined ? Number(status) : existingDoc.status,
        updated_at: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Driver details updated successfully",
        data: existingDoc,
      });
    }

    let finalDocUrl = null;
    if (uploadedFile) {
      finalDocUrl = uploadedFile.filename;
    } else if (bodyDocUrl) {
      finalDocUrl = bodyDocUrl;
    }

    const newRecord = await DriverDetails.create({
      driver_id,
      doc_type,
      doc_url: finalDocUrl,
      exp_date: doc_type === "A" || doc_type === "BK" ? null : exp_date || null,
      status: status !== undefined ? Number(status) : 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Driver details created successfully",
      data: newRecord,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFile);
    console.error("Save Driver Details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save driver details",
      error: error.message,
    });
  }
};

/**
 * 2. Single function for Get Single & Get All
 * - If params.id is provided -> Fetch single driver detail by id
 * - If params.id is NOT provided -> Fetch all driver details (with optional query filters)
 */
exports.getDriverDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // GET SINGLE BY ID
    // ==========================================
    if (id) {
      const record = await DriverDetails.findByPk(id, {
        include: [
          {
            model: Driver,
            as: "driver",
            attributes: ["id", "driver_name", "driver_phone", "driver_email", "status"],
          },
        ],
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: `Driver details record with id ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: record,
      });
    }

    // ==========================================
    // GET ALL WITH FILTERS (?driver_id=...&doc_type=...&status=...)
    // ==========================================
    const { driver_id, doc_type, status } = req.query;
    const filter = {};

    if (driver_id) filter.driver_id = driver_id;
    if (doc_type) filter.doc_type = doc_type;
    if (status !== undefined) filter.status = Number(status);

    const records = await DriverDetails.findAll({
      where: filter,
      include: [
        {
          model: Driver,
          as: "driver",
          attributes: ["id", "driver_name", "driver_phone", "driver_email", "status"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get Driver Details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve driver details",
      error: error.message,
    });
  }
};

/**
 * 3. Delete Driver Details by ID
 */
exports.deleteDriverDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await DriverDetails.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Driver details record with id ${id} not found`,
      });
    }

    // Delete associated physical file if exists
    if (record.doc_url) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(record.doc_url));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete document file:", err.message);
        }
      }
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: "Driver details record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Driver Details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete driver details record",
      error: error.message,
    });
  }
};

/**
 * 4. Toggle Status (1 -> 0, 0 -> 1)
 */
exports.toggleDriverDetailsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await DriverDetails.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Driver details record with id ${id} not found`,
      });
    }

    const newStatus = record.status === 1 ? 0 : 1;

    await record.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Driver details status updated successfully",
      data: {
        id: record.id,
        driver_id: record.driver_id,
        doc_type: record.doc_type,
        status: newStatus,
        updated_at: record.updated_at,
      },
    });
  } catch (error) {
    console.error("Toggle Driver Details Status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle driver details status",
      error: error.message,
    });
  }
};

