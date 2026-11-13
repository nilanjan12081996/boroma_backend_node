const express = require("express");
const router = express.Router();
const bookingController = require("../../controller/booking/booking.controller");

// Create / Save Booking (Unified API for Guest + Booking)
router.post("/save", bookingController.createBooking);


// Get All Bookings (?search=&status=&date=&transport_type=&car_type=&page=&limit=)

router.get("/getAll", bookingController.getAllBookings);

// Get Single Booking by ID
router.get("/get/:id", bookingController.getBookingById);

// Update Booking (Unified API to update Booking + Guest details)
router.put("/update/:id", bookingController.updateBooking);
router.patch("/update/:id", bookingController.updateBooking);

// Delete Booking
router.delete("/delete/:id", bookingController.deleteBooking);

module.exports = router;

