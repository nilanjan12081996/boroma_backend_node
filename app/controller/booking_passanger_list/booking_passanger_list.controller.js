const { Op } = require("sequelize");
const { sequelize } = require("../../config/db");
const BookingPassangerList = require("../../models/booking_passanger_list.model");
const BookingDetails = require("../../models/booking_details.model");
const Guest = require("../../models/guest.model");

/**
 * 1. Add / Create Passenger (Supports Single or Bulk Add)
 * URL: POST /api/booking-passanger-list/save
 *
 * Single Passenger Body:
 * {
 *   "booking_id": 1,
 *   "guest_id": 2, // optional
 *   "passanger_name": "Rahim Ahmed",
 *   "passanger_email": "rahim@example.com", // optional
 *   "passanger_phone": "01700000000",       // optional
 *   "status": 1                             // optional (default: 1)
 * }
 *
 * Bulk Passengers Body:
 * {
 *   "booking_id": 1,
 *   "passengers": [
 *     { "passanger_name": "Rahim Ahmed", "passanger_phone": "01700000000", "passanger_email": "rahim@example.com" },
 *     { "passanger_name": "Karim Ahmed", "passanger_phone": "01800000000" }
 *   ]
 * }
 */
exports.createPassenger = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { booking_id, guest_id, passanger_name, passanger_email, passanger_phone, status, passengers } = req.body;

    // --- Bulk creation support ---
    if (passengers && Array.isArray(passengers) && passengers.length > 0) {
      const targetBookingId = booking_id || passengers[0]?.booking_id;

      if (!targetBookingId) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "booking_id is required for bulk passenger creation",
        });
      }

      // Check if booking exists
      const bookingExists = await BookingDetails.findByPk(targetBookingId, { transaction: t });
      if (!bookingExists) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Booking with ID ${targetBookingId} not found`,
        });
      }

      const passengerRecords = [];
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.passanger_name || !p.passanger_name.trim()) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Passenger name is required at index ${i}`,
          });
        }

        passengerRecords.push({
          booking_id: targetBookingId,
          guest_id: p.guest_id || null,
          passanger_name: p.passanger_name.trim(),
          passanger_email: p.passanger_email && p.passanger_email.trim() ? p.passanger_email.trim().toLowerCase() : null,
          passanger_phone: p.passanger_phone && p.passanger_phone.trim() ? p.passanger_phone.trim() : null,
          status: p.status !== undefined ? p.status : 1,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      const createdPassengers = await BookingPassangerList.bulkCreate(passengerRecords, {
        transaction: t,
      });

      await t.commit();

      return res.status(201).json({
        success: true,
        message: `${createdPassengers.length} passengers added successfully`,
        data: createdPassengers,
      });
    }

    // --- Single passenger creation ---
    if (!booking_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "booking_id is required",
      });
    }

    if (!passanger_name || !passanger_name.trim()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "passanger_name is required",
      });
    }

    // Check if booking exists
    const bookingExists = await BookingDetails.findByPk(booking_id, { transaction: t });
    if (!bookingExists) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${booking_id} not found`,
      });
    }

    // If guest_id is provided, verify guest exists
    if (guest_id) {
      const guestExists = await Guest.findByPk(guest_id, { transaction: t });
      if (!guestExists) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Guest with ID ${guest_id} not found`,
        });
      }
    }

    const newPassenger = await BookingPassangerList.create(
      {
        booking_id,
        guest_id: guest_id || null,
        passanger_name: passanger_name.trim(),
        passanger_email: passanger_email && passanger_email.trim() ? passanger_email.trim().toLowerCase() : null,
        passanger_phone: passanger_phone && passanger_phone.trim() ? passanger_phone.trim() : null,
        status: status !== undefined ? status : 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Passenger added successfully",
      data: newPassenger,
    });
  } catch (error) {
    await t.rollback();
    console.error("Create Passenger Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding passenger",
      error: error.message,
    });
  }
};

/**
 * 2. Get All Passengers (with Search, Filter, Pagination)
 * URL: GET /api/booking-passanger-list/getAll
 * Query params: ?booking_id=&guest_id=&search=&status=&page=&limit=
 */
exports.getAllPassengers = async (req, res) => {
  try {
    const { booking_id, guest_id, search, status, page = 1, limit = 10 } = req.query;

    const where = {};

    if (booking_id) {
      where.booking_id = booking_id;
    }

    if (guest_id) {
      where.guest_id = guest_id;
    }

    if (status !== undefined && status !== "") {
      where.status = parseInt(status, 10);
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { passanger_name: { [Op.like]: searchTerm } },
        { passanger_email: { [Op.like]: searchTerm } },
        { passanger_phone: { [Op.like]: searchTerm } },
      ];
    }

    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await BookingPassangerList.findAndCountAll({
      where,
      include: [
        {
          model: BookingDetails,
          as: "booking",
          attributes: ["id", "booking_id", "date", "pickup_place", "seat_require", "status"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status"],
        },
      ],
      order: [["id", "DESC"]],
      limit: parsedLimit,
      offset: offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Passengers fetched successfully",
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
      data: rows,
    });
  } catch (error) {
    console.error("Get All Passengers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching passengers",
      error: error.message,
    });
  }
};

/**
 * 3. Get Single Passenger by ID
 * URL: GET /api/booking-passanger-list/get/:id
 */
exports.getPassengerById = async (req, res) => {
  try {
    const { id } = req.params;

    const passenger = await BookingPassangerList.findByPk(id, {
      include: [
        {
          model: BookingDetails,
          as: "booking",
          attributes: ["id", "booking_id", "date", "pickup_place", "seat_require", "status"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status"],
        },
      ],
    });

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: `Passenger with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: passenger,
    });
  } catch (error) {
    console.error("Get Passenger By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching passenger",
      error: error.message,
    });
  }
};

/**
 * 4. Get All Passengers for a Specific Booking
 * URL: GET /api/booking-passanger-list/by-booking/:booking_id
 */
exports.getPassengersByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;

    // Check if booking exists
    const booking = await BookingDetails.findByPk(booking_id, {
      attributes: ["id", "booking_id", "date", "pickup_place", "seat_require", "status"],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${booking_id} not found`,
      });
    }

    const passengers = await BookingPassangerList.findAll({
      where: { booking_id },
      include: [
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: `Passengers for booking ID ${booking_id} fetched successfully`,
      booking: booking,
      total: passengers.length,
      data: passengers,
    });
  } catch (error) {
    console.error("Get Passengers By Booking ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching passengers by booking ID",
      error: error.message,
    });
  }
};

/**
 * 5. Update Passenger
 * URL: PUT /api/booking-passanger-list/update/:id
 */
exports.updatePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      guest_id,
      passanger_name,
      passanger_email,
      passanger_phone,
      status,
    } = req.body;

    const passenger = await BookingPassangerList.findByPk(id);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: `Passenger with ID ${id} not found`,
      });
    }

    // If updating booking_id, verify existence
    if (booking_id !== undefined && booking_id !== passenger.booking_id) {
      const bookingExists = await BookingDetails.findByPk(booking_id);
      if (!bookingExists) {
        return res.status(404).json({
          success: false,
          message: `Booking with ID ${booking_id} not found`,
        });
      }
    }

    // If updating guest_id, verify existence
    if (guest_id !== undefined && guest_id !== null && guest_id !== passenger.guest_id) {
      const guestExists = await Guest.findByPk(guest_id);
      if (!guestExists) {
        return res.status(404).json({
          success: false,
          message: `Guest with ID ${guest_id} not found`,
        });
      }
    }

    const updates = {};
    if (booking_id !== undefined) updates.booking_id = booking_id;
    if (guest_id !== undefined) updates.guest_id = guest_id || null;
    if (passanger_name !== undefined) updates.passanger_name = passanger_name.trim();
    if (passanger_email !== undefined) {
      updates.passanger_email = passanger_email && passanger_email.trim() ? passanger_email.trim().toLowerCase() : null;
    }
    if (passanger_phone !== undefined) {
      updates.passanger_phone = passanger_phone && passanger_phone.trim() ? passanger_phone.trim() : null;
    }
    if (status !== undefined) updates.status = parseInt(status, 10);
    updates.updated_at = new Date();

    await passenger.update(updates);

    // Reload with associations
    const updatedPassenger = await BookingPassangerList.findByPk(id, {
      include: [
        {
          model: BookingDetails,
          as: "booking",
          attributes: ["id", "booking_id", "date", "pickup_place", "seat_require", "status"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "guest_name", "mobile", "email", "status"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Passenger updated successfully",
      data: updatedPassenger,
    });
  } catch (error) {
    console.error("Update Passenger Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating passenger",
      error: error.message,
    });
  }
};

/**
 * 6. Delete Passenger
 * URL: DELETE /api/booking-passanger-list/delete/:id
 */
exports.deletePassenger = async (req, res) => {
  try {
    const { id } = req.params;

    const passenger = await BookingPassangerList.findByPk(id);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: `Passenger with ID ${id} not found`,
      });
    }

    await passenger.destroy();

    return res.status(200).json({
      success: true,
      message: "Passenger deleted successfully",
    });
  } catch (error) {
    console.error("Delete Passenger Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting passenger",
      error: error.message,
    });
  }
};

/**
 * 7. Toggle Passenger Status (Active/Inactive)
 * URL: PATCH /api/booking-passanger-list/toggle-status/:id
 */
exports.togglePassengerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const passenger = await BookingPassangerList.findByPk(id);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: `Passenger with ID ${id} not found`,
      });
    }

    const newStatus = passenger.status === 1 ? 0 : 1;
    await passenger.update({
      status: newStatus,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Passenger status changed to ${newStatus === 1 ? "Active" : "Inactive"} successfully`,
      data: {
        id: passenger.id,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Toggle Passenger Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while toggling passenger status",
      error: error.message,
    });
  }
};
