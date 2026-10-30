const express = require('express');
const router = express.Router();
const companyCarMapController = require('../../controller/company_car_maps/company_car_maps.controller');

// Create a new mapping (single or multiple vehicles)
router.post('/create', companyCarMapController.createCompanyVehicleMap);

// Get all mappings (supports query filters)
router.get('/getAll', companyCarMapController.getAllCompanyVehicleMaps);

// Get available vehicles for registration (NOT registered in any company)
router.get('/available-vehicles', companyCarMapController.getAvailableVehicles);
router.get('/unmapped-vehicles', companyCarMapController.getAvailableVehicles);

// Get mappings for a specific company (vehicles list)
router.get('/company/:company_id/vehicles', companyCarMapController.getVehiclesByCompanyId);

// Get a single mapping by ID
router.get('/:id', companyCarMapController.getCompanyVehicleMapById);

// Delete a mapping by ID
router.delete('/:id', companyCarMapController.deleteCompanyVehicleMap);

// Toggle mapping status (active/inactive)
router.patch('/:id/status', companyCarMapController.toggleCompanyVehicleMapStatus);

module.exports = router;
