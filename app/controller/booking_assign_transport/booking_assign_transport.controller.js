const { Op } = require("sequelize");
const { sequelize } = require("../../config/db");
const BookingAssignTransport = require("../../models/booking_assign_transport.model");
const BookingDetails = require("../../models/booking_details.model");
const VehicleInfo = require("../../models/vehicle_info.model");
const Category = require("../../models/category.model");
const CategoryVehicalMap = require("../../models/category_vehical_map.model");
const Guest = require("../../models/guest.model");

/**
 * 1. Get Available Transports / Vehicles
 * URL: GET /api/booking-assign/available-transports
 * Query params: ?booking_id=... or ?vehicle_type=...&transport_type=...&min_seats=...
 *
 * Shows all active vehicles with their vehicle_type / transport_type categories,
 * optionally filtered to match a specific booking.
 */
exports.getAvailableTransports = async (req, res) => {
  try {
    const { booking_id, vehicle_type, transport_type, min_seats } = req.query;

    let targetVehicleType = vehicle_type;
    let targetMinSeats = min_seats ? parseInt(min_seats, 10) : null;

    // If booking_id is provided, automatically fetch the booking's requirements
    if (booking_id) {
      const booking = await BookingDetails.findByPk(booking_id, {
        include: [
          { model: Category, as: "vehicleType" },
          { model: Category, as: "transportType" },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `Booking with ID ${booking_id} not found`,
        });
      }

      if (!targetVehicleType && booking.vehicle_type) {
        targetVehicleType = booking.vehicle_type;
      }
      if (!targetMinSeats && booking.seat_require) {
        targetMinSeats = booking.seat_require;
      }
    }

    const vehicleWhere = { status: 1 };
    if (targetMinSeats) {
      vehicleWhere.no_of_seat = { [Op.gte]: targetMinSeats };
    }

    // Category filter if vehicle_type / category_id is specified
    const categoryInclude = {
      model: Category,
      as: "categories",
      through: { attributes: [] },
      attributes: ["id", "category_name", "short_name", "status"],
    };

    if (targetVehicleType) {
      categoryInclude.where = { id: targetVehicleType };
    }

    const availableVehicles = await VehicleInfo.findAll({
      where: vehicleWhere,
      include: [categoryInclude],
      order: [["no_of_seat", "ASC"]],
    });

    // Format response cleanly with resolved transport_type & vehicle_type
    const formatted = availableVehicles.map((v) => {
      const cats = v.categories || [];
      const transCat = cats.find(
        (c) => (c.short_name || "").toLowerCase() === "transport_type"
      );
      const vehicleCat = cats.find(
        (c) => (c.short_name || "").toLowerCase() === "car_type" || (c.short_name || "").toLowerCase() === "bus_type"
      );

      return {
        transport_id: v.id,
        vehicle_no: v.vehicle_no,
        no_of_seat: v.no_of_seat,
        status: v.status,
        transport_type: transCat ? transCat.category_name : null,
        vehicle_type: vehicleCat ? vehicleCat.category_name : null,
        categories: cats,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Available transports fetched successfully",
      total: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get Available Transports Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available transports",
      error: error.message,
    });
  }
};

/**
 * 2. Assign Transport to Booking
 * URL: POST /api/booking-assign/assign
 * Headers: Authorization: Bearer <Admin_JWT_Token>
 *
 * Body:
 * {
 *   "booking_id": 1,
 *   "transport_id": 5,
 *   "transport_type": "SEDAN"   // optional: auto-detected from vehicle if omitted
 * }
 *
 * approved_by and approved_type are automatically extracted from the logged-in admin token:
 * - approved_by = req.user.id
 * - approved_type = req.user.role (e.g. SUPERADMIN, ADMIN, OPERATOR)
 */
exports.assignTransport = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { booking_id, transport_id, transport_type } = req.body;

    // --- Validations ---
    if (!booking_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "booking_id is required",
      });
    }

    if (!transport_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "transport_id is required",
      });
    }

    // 1. Get logged-in Admin's info from token
    const approved_by = req.user?.id || null;
    const approved_type = req.user?.role || req.user?.user_type || "ADMIN";

    // 2. Verify Booking exists
    const booking = await BookingDetails.findByPk(booking_id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${booking_id} not found`,
      });
    }

    // 3. Verify Transport / Vehicle exists
    const vehicle = await VehicleInfo.findByPk(transport_id, {
      include: [{ model: Category, as: "categories", through: { attributes: [] } }],
      transaction: t,
    });

    if (!vehicle) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Transport / Vehicle with ID ${transport_id} not found`,
      });
    }

    // 4. Resolve transport_type string if not provided in body
    let finalTransportType = transport_type ? transport_type.trim() : null;
    if (!finalTransportType && vehicle.categories && vehicle.categories.length > 0) {
      // Find category name (e.g. SEDAN, SUV, BUS, etc.)
      const cat = vehicle.categories.find(
        (c) => (c.short_name || "").toLowerCase() === "car_type" || (c.short_name || "").toLowerCase() === "bus_type"
      ) || vehicle.categories[0];
      finalTransportType = cat ? cat.category_name : null;
    }

    // 5. Create or Update BookingAssignTransport record
    // If transport was already assigned, update or create new record
    let assignment = await BookingAssignTransport.findOne({
      where: { booking_id },
      transaction: t,
    });

    if (assignment) {
      await assignment.update(
        {
          transport_id,
          transport_type: finalTransportType,
          approved_by,
          approved_type,
          status: 1,
        },
        { transaction: t }
      );
    } else {
      assignment = await BookingAssignTransport.create(
        {
          booking_id,
          transport_id,
          transport_type: finalTransportType,
          approved_by,
          approved_type,
          status: 1,
        },
        { transaction: t }
      );
    }

    // 6. Optionally update booking status to 2 (Assigned/Confirmed)
    await booking.update({ status: 2 }, { transaction: t });

    await t.commit();

    // Fetch complete assignment details with relations
    const completeAssignment = await BookingAssignTransport.findByPk(assignment.id, {
      include: [
        {
          model: BookingDetails,
          as: "booking",
          include: [{ model: Guest, as: "guest" }],
        },
        {
          model: VehicleInfo,
          as: "vehicle",
          attributes: ["id", "vehicle_no", "no_of_seat", "status"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Transport assigned successfully to booking",
      data: completeAssignment,
    });
  } catch (error) {
    await t.rollback();
    console.error("Assign Transport Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while assigning transport",
      error: error.message,
    });
  }
};

/**
 * 3. Get All Assigned Transports
 * URL: GET /api/booking-assign/getAll
 */
exports.getAllAssignedTransports = async (req, res) => {
  try {
    const { booking_id, status } = req.query;
    const where = {};

    if (booking_id) where.booking_id = booking_id;
    if (status !== undefined) where.status = status;

    const assignments = await BookingAssignTransport.findAll({
      where,
      include: [
        {
          model: BookingDetails,
          as: "booking",
          include: [{ model: Guest, as: "guest" }],
        },
        {
          model: VehicleInfo,
          as: "vehicle",
          attributes: ["id", "vehicle_no", "no_of_seat", "status"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Assigned transports fetched successfully",
      total: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get All Assigned Transports Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned transports",
      error: error.message,
    });
  }
};

/**
 * 4. Get Assigned Transport by Booking ID
 * URL: GET /api/booking-assign/by-booking/:booking_id
 */
exports.getAssignedTransportByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const assignment = await BookingAssignTransport.findOne({
      where: { booking_id },
      include: [
        {
          model: BookingDetails,
          as: "booking",
          include: [{ model: Guest, as: "guest" }],
        },
        {
          model: VehicleInfo,
          as: "vehicle",
          attributes: ["id", "vehicle_no", "no_of_seat", "status"],
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: `No transport assigned yet for booking ID ${booking_id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get Assigned Transport Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned transport",
      error: error.message,
    });
  }
};
