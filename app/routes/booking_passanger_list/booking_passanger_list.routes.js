const express = require("express");
const router = express.Router();
const passengerController = require("../../controller/booking_passanger_list/booking_passanger_list.controller");

// 1. Create / Add Passenger (Supports single passenger or bulk array)
router.post("/save", passengerController.createPassenger);
router.post("/add", passengerController.createPassenger);

// 2. Get All Passengers (?booking_id=&guest_id=&search=&status=&page=&limit=)
router.get("/getAll", passengerController.getAllPassengers);
router.get("/get", passengerController.getAllPassengers);

// 3. Get Single Passenger by ID
router.get("/get/:id", passengerController.getPassengerById);

// 4. Get All Passengers for a Specific Booking
router.get("/by-booking/:booking_id", passengerController.getPassengersByBookingId);

// 5. Update Passenger Details
router.put("/update/:id", passengerController.updatePassenger);
router.patch("/update/:id", passengerController.updatePassenger);

// 6. Toggle Passenger Status (Active/Inactive)
router.patch("/toggle-status/:id", passengerController.togglePassengerStatus);

// 7. Delete Passenger
router.delete("/delete/:id", passengerController.deletePassenger);

module.exports = router;
