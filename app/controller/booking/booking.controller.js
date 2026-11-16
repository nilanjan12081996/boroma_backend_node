const { Op } = require("sequelize");
const { sequelize } = require("../../config/db");
const BookingDetails = require("../../models/booking_details.model");
const Guest = require("../../models/guest.model");
const Category = require("../../models/category.model");

/**
 * Helper: Generate unique Booking ID (e.g., BK-1731481234-9876)
 */
const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${timestamp}-${random}`;
};

/**
 * 1. Unified Create Booking (Saves Guest + Booking in single API)
 * Request Body:
 * {
 *   guest_name: "John Doe",
 *   mobile: "9876543210",
 *   email: "john@example.com",     // optional
 *   date: "2026-11-20",
 *   pickup_place: "Airport",
 *   seat_require: 4,
 *   vehicle_type: 23,             // Category ID
 *   transport_type: 30,           // Category ID
 *   booking_id: "BK-12345"        // optional (auto-generated if omitted)
 * }
 */
exports.createBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      guest_name,
      mobile,
      email,
      date,
      pickup_place,
      seat_require,
      vehicle_type,
      transport_type,
      status,
    } = req.body;

    const resolvedVehicleType =
      vehicle_type !== undefined && vehicle_type !== null && vehicle_type !== ""
        ? vehicle_type
        : req.body.car_type !== undefined && req.body.car_type !== null && req.body.car_type !== ""
        ? req.body.car_type
        : null;

    // --- Validations ---
    if (!guest_name || !guest_name.trim()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Guest name is required",
      });
    }

    if (!mobile || !mobile.trim()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Guest mobile number is required",
      });
    }

    if (!date) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Booking date is required",
      });
    }

    const trimmedMobile = mobile.trim();
    const trimmedEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    // --- Step 1: Find or Create Guest ---
    // Check if guest already exists by mobile (or email if provided)
    const guestSearchConditions = [{ mobile: trimmedMobile }];
    if (trimmedEmail) {
      guestSearchConditions.push({ email: trimmedEmail });
    }

    let guest = await Guest.findOne({
      where: { [Op.or]: guestSearchConditions },
      transaction: t,
    });

    if (guest) {
      // If guest exists, update name if changed
      await guest.update(
        {
          guest_name: guest_name.trim(),
          ...(trimmedEmail && !guest.email ? { email: trimmedEmail } : {}),
        },
        { transaction: t }
      );
    } else {
      // Create new Guest (password, otp, otp_exp remain null for now)
      guest = await Guest.create(
        {
          guest_name: guest_name.trim(),
          mobile: trimmedMobile,
          email: trimmedEmail,
          password: null,
          otp: null,
          otp_exp: null,
          status: 1,
        },
        { transaction: t }
      );
    }

    // --- Step 2: Validate vehicle_type and transport_type against Category table ---
    if (resolvedVehicleType) {
      const vehicleCat = await Category.findByPk(resolvedVehicleType, { transaction: t });
      if (!vehicleCat) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Category with ID ${resolvedVehicleType} for 'vehicle_type' does not exist in category table`,
        });
      }
    }

    if (transport_type) {
      const transCat = await Category.findByPk(transport_type, { transaction: t });
      if (!transCat) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Category with ID ${transport_type} for 'transport_type' does not exist in category table`,
        });
      }
    }

    // --- Step 3: Create Booking Details ---
    const booking_id = req.body.booking_id && req.body.booking_id.trim()
      ? req.body.booking_id.trim()
      : generateBookingId();

    const booking = await BookingDetails.create(
      {
        booking_id,
        guest_id: guest.id,
        date,
        pickup_place: pickup_place ? pickup_place.trim() : null,
        seat_require: seat_require ? parseInt(seat_require, 10) : null,
        vehicle_type: resolvedVehicleType ? parseInt(resolvedVehicleType, 10) : null,
        transport_type: transport_type ? parseInt(transport_type, 10) : null,
        status: status !== undefined ? status : 1,
      },
      { transaction: t }
    );

    // Commit Transaction
    await t.commit();

    // Fetch complete booking with relations
    const completeBooking = await BookingDetails.findByPk(booking.id, {
      include: [
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status", "created_at"],
        },
        {
          model: Category,
          as: "transportType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
        {
          model: Category,
          as: "vehicleType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: completeBooking,
    });
  } catch (error) {
    await t.rollback();
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating booking",
      error: error.message,
    });
  }
};

/**
 * 2. Unified Update Booking (Updates Booking + Guest details in single API)
 * URL: PUT /api/booking/update/:id
 */
exports.updateBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      guest_name,
      mobile,
      email,
      date,
      pickup_place,
      seat_require,
      vehicle_type,
      transport_type,
      status,
      booking_id,
    } = req.body;

    const resolvedVehicleType =
      vehicle_type !== undefined
        ? vehicle_type
        : req.body.car_type !== undefined
        ? req.body.car_type
        : undefined;

    // Check if booking exists
    const booking = await BookingDetails.findByPk(id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${id} not found`,
      });
    }

    // --- Step 1: Update Guest Details if provided ---
    if (booking.guest_id && (guest_name !== undefined || mobile !== undefined || email !== undefined)) {
      const guest = await Guest.findByPk(booking.guest_id, { transaction: t });
      if (guest) {
        const guestUpdates = {};
        if (guest_name !== undefined) guestUpdates.guest_name = guest_name.trim();
        if (mobile !== undefined) guestUpdates.mobile = mobile.trim();
        if (email !== undefined) guestUpdates.email = email ? email.trim().toLowerCase() : null;

        await guest.update(guestUpdates, { transaction: t });
      }
    }

    // --- Step 2: Update Booking Details ---
    const bookingUpdates = {};
    if (date !== undefined) bookingUpdates.date = date;
    if (pickup_place !== undefined) bookingUpdates.pickup_place = pickup_place ? pickup_place.trim() : null;
    if (seat_require !== undefined) bookingUpdates.seat_require = seat_require ? parseInt(seat_require, 10) : null;

    if (resolvedVehicleType !== undefined) {
      if (resolvedVehicleType) {
        const vehicleCat = await Category.findByPk(resolvedVehicleType, { transaction: t });
        if (!vehicleCat) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Category with ID ${resolvedVehicleType} for 'vehicle_type' does not exist in category table`,
          });
        }
      }
      bookingUpdates.vehicle_type = resolvedVehicleType ? parseInt(resolvedVehicleType, 10) : null;
    }

    if (transport_type !== undefined) {
      if (transport_type) {
        const transCat = await Category.findByPk(transport_type, { transaction: t });
        if (!transCat) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Category with ID ${transport_type} for 'transport_type' does not exist in category table`,
          });
        }
      }
      bookingUpdates.transport_type = transport_type ? parseInt(transport_type, 10) : null;
    }
    if (status !== undefined) bookingUpdates.status = status;
    if (booking_id !== undefined) bookingUpdates.booking_id = booking_id.trim();

    await booking.update(bookingUpdates, { transaction: t });

    // Commit Transaction
    await t.commit();

    // Fetch updated booking with relations
    const updatedBooking = await BookingDetails.findByPk(id, {
      include: [
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status", "created_at"],
        },
        {
          model: Category,
          as: "transportType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
        {
          model: Category,
          as: "vehicleType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Booking and Guest details updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    await t.rollback();
    console.error("Update Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating booking",
      error: error.message,
    });
  }
};

/**
 * 3. Get All Bookings (Supports search, filter, pagination)
 * URL: GET /api/booking/get
 */
exports.getAllBookings = async (req, res) => {
  try {
    const {
      search,
      status,
      date,
      transport_type,
      vehicle_type,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const whereConditions = {};
    const guestWhereConditions = {};

    if (status !== undefined && status !== "") {
      whereConditions.status = status;
    }

    if (date) {
      whereConditions.date = date;
    }

    if (transport_type) {
      whereConditions.transport_type = transport_type;
    }

    if (vehicle_type) {
      whereConditions.vehicle_type = vehicle_type;
    }

    if (search && search.trim()) {
      const searchVal = `%${search.trim()}%`;
      whereConditions[Op.or] = [
        { booking_id: { [Op.like]: searchVal } },
        { pickup_place: { [Op.like]: searchVal } },
      ];
    }

    const { count, rows } = await BookingDetails.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Guest,
          as: "guest",
          where: Object.keys(guestWhereConditions).length ? guestWhereConditions : undefined,
          attributes: ["id", "guest_name", "mobile", "email", "status", "created_at"],
        },
        {
          model: Category,
          as: "transportType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
        {
          model: Category,
          as: "vehicleType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
      ],
      order: [["id", "DESC"]],
      limit: parseInt(limit, 10),
      offset: offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      data: rows,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching bookings",
      error: error.message,
    });
  }
};

/**
 * 4. Get Single Booking by ID
 * URL: GET /api/booking/get/:id
 */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await BookingDetails.findByPk(id, {
      include: [
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status", "created_at"],
        },
        {
          model: Category,
          as: "transportType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
        {
          model: Category,
          as: "vehicleType",
          attributes: ["id", "category_name", "short_name", "status"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get Booking By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching booking",
      error: error.message,
    });
  }
};

/**
 * 5. Delete Booking
 * URL: DELETE /api/booking/delete/:id
 */
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await BookingDetails.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${id} not found`,
      });
    }

    await booking.destroy();

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting booking",
      error: error.message,
    });
  }
};

