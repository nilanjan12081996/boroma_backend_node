const { Op } = require('sequelize');
const CompanyCarMap = require('../../models/company_car_maps.model');
const Company = require('../../models/company.model');
const VehicleInfo = require('../../models/vehicle_info.model');

// Helper to format response (optional)
const formatMapping = (mapping, req) => {
  const json = mapping.toJSON ? mapping.toJSON() : mapping;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    id: json.id,
    company_id: json.company_id,
    vehicle_id: json.vehicle_id,
    status: json.status,
    // You can embed related data URLs if needed
  };
};

// Create a new company‑vehicle mapping (single or multiple vehicles)
exports.createCompanyVehicleMap = async (req, res) => {
  try {
    const { company_id, vehicle_id, vehicle_ids, status, replace } = req.body;
    if (!company_id) {
      return res.status(400).json({ success: false, message: 'company_id is required' });
    }
    // Normalize vehicle IDs to an array of unique positive numbers
    let vehicleArray = [];
    if (Array.isArray(vehicle_ids)) {
      vehicleArray = vehicle_ids;
    } else if (vehicle_id) {
      vehicleArray = [vehicle_id];
    } else if (typeof vehicle_ids === 'string') {
      vehicleArray = vehicle_ids.split(',').map(v => v.trim());
    } else {
      return res.status(400).json({ success: false, message: 'vehicle_id(s) are required' });
    }
    vehicleArray = [...new Set(vehicleArray.map(v => Number(v)).filter(v => !isNaN(v) && v > 0))];
    if (vehicleArray.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid vehicle_id is required' });
    }
    // Verify company exists
    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    // Verify vehicles exist
    const existingVehicles = await VehicleInfo.findAll({ where: { id: vehicleArray } });
    const existingIds = existingVehicles.map(v => Number(v.id));
    const missingVehicleIds = vehicleArray.filter(v => !existingIds.includes(v));
    // If replace flag, delete previous mappings for this company
    if (replace === true) {
      await CompanyCarMap.destroy({ where: { company_id } });
    }
    // Avoid duplicate active mappings
    const existingMappings = await CompanyCarMap.findAll({ where: { company_id, vehicle_id: existingIds } });
    const alreadyMapped = existingMappings.map(m => Number(m.vehicle_id));
    const newVehicleIds = existingIds.filter(v => !alreadyMapped.includes(v));
    if (newVehicleIds.length === 0) {
      return res.status(409).json({ success: false, message: 'All provided vehicles are already mapped', already_mapped_vehicle_ids: alreadyMapped, missing_vehicle_ids: missingVehicleIds });
    }
    const records = newVehicleIds.map(vId => ({ company_id, vehicle_id: vId, status: status !== undefined ? Number(status) : 1 }));
    const created = await CompanyCarMap.bulkCreate(records);
    return res.status(201).json({
      success: true,
      message: 'Company‑vehicle mappings created',
      created_count: created.length,
      missing_vehicle_ids: missingVehicleIds,
      data: created,
    });
  } catch (error) {
    console.error('Create CompanyVehicleMap error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create mapping', error: error.message });
  }
};

// Get all mappings with optional filters
exports.getAllCompanyVehicleMaps = async (req, res) => {
  try {
    const { company_id, vehicle_id, status } = req.query;
    const filter = {};
    if (company_id) filter.company_id = company_id;
    if (vehicle_id) filter.vehicle_id = vehicle_id;
    if (status !== undefined) filter.status = Number(status);
    const mappings = await CompanyCarMap.findAll({ where: filter, include: [{ model: Company, as: 'company' }, { model: VehicleInfo, as: 'vehicle' }] });
    return res.status(200).json({ success: true, message: 'Mappings fetched', total: mappings.length, data: mappings });
  } catch (error) {
    console.error('Get all CompanyVehicleMaps error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch mappings', error: error.message });
  }
};

// Get single mapping by ID
exports.getCompanyVehicleMapById = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CompanyCarMap.findByPk(id, { include: [{ model: Company, as: 'company' }, { model: VehicleInfo, as: 'vehicle' }] });
    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }
    return res.status(200).json({ success: true, message: 'Mapping fetched', data: mapping });
  } catch (error) {
    console.error('Get CompanyVehicleMap by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch mapping', error: error.message });
  }
};

// Delete mapping by ID
exports.deleteCompanyVehicleMap = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CompanyCarMap.findByPk(id);
    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }
    await mapping.destroy();
    return res.status(200).json({ success: true, message: 'Mapping deleted' });
  } catch (error) {
    console.error('Delete CompanyVehicleMap error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete mapping', error: error.message });
  }
};

// Toggle mapping status (active/inactive)
exports.toggleCompanyVehicleMapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CompanyCarMap.findByPk(id);
    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }
    const newStatus = mapping.status === 1 ? 0 : 1;
    await mapping.update({ status: newStatus });
    return res.status(200).json({ success: true, message: 'Mapping status updated', data: { id: mapping.id, status: newStatus } });
  } catch (error) {
    console.error('Toggle status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

// Get all vehicles for a specific company
exports.getVehiclesByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const mappings = await CompanyCarMap.findAll({ where: { company_id }, include: [{ model: VehicleInfo, as: 'vehicle' }] });
    return res.status(200).json({ success: true, message: 'Vehicles for company fetched', total: mappings.length, data: mappings });
  } catch (error) {
    console.error('Get vehicles by company error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicles', error: error.message });
  }
};
