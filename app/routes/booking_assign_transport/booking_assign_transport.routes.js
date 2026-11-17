const express = require("express");
const router = express.Router();
const assignController = require("../../controller/booking_assign_transport/booking_assign_transport.controller");
const authCheck = require("../../middleware/authCheck");

// 1. Get Available Transports / Vehicles (Supports ?booking_id=... to match booking needs)
router.get("/available-transports", authCheck, assignController.getAvailableTransports);
router.get("/available-transports/:booking_id", authCheck, (req, res, next) => {
  req.query.booking_id = req.params.booking_id;
  next();
}, assignController.getAvailableTransports);

// 2. Assign Transport to Booking (approved_by & approved_type taken from auth token)
router.post("/assign", authCheck, assignController.assignTransport);


// 3. Get All Assigned Transports

router.get("/get", authCheck, assignController.getAllAssignedTransports);

// 4. Get Assigned Transport for specific Booking
router.get("/by-booking/:booking_id", authCheck, assignController.getAssignedTransportByBookingId);

module.exports = router;
