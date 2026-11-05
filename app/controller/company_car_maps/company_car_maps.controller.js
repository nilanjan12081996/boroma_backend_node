const { Op } = require('sequelize');
const CompanyCarMap = require('../../models/company_car_maps.model');
const Company = require('../../models/company.model');
const VehicleInfo = require('../../models/vehicle_info.model');
const Category = require('../../models/category.model');
const VehicleImage = require('../../models/vehicle_image.model');
require('../../models/category_vehical_map.model');

// Helper to format response (optional)
const formatMapping = (mapping, req) => {
  const json = mapping.toJSON ? mapping.toJSON() : mapping;
  return {
    id: json.id,
    company_id: json.company_id,
    vehicle_id: json.vehicle_id,
    status: json.status,
  };
};

// Create a new company‑vehicle mapping (single or multiple vehicles)
// Enforces that a vehicle already registered to ANY company cannot be registered again until deleted!
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
      vehicleArray = vehicle_ids.split(',').map((v) => v.trim());
    } else {
      return res.status(400).json({ success: false, message: 'vehicle_id(s) are required' });
    }

    vehicleArray = [...new Set(vehicleArray.map((v) => Number(v)).filter((v) => !isNaN(v) && v > 0))];
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
    const existingIds = existingVehicles.map((v) => Number(v.id));
    const missingVehicleIds = vehicleArray.filter((v) => !existingIds.includes(v));

    if (existingIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'None of the provided vehicles exist in the database',
        missing_vehicle_ids: missingVehicleIds,
      });
    }

    // If replace flag is true, remove previous mappings for THIS company first
    if (replace === true) {
      await CompanyCarMap.destroy({ where: { company_id } });
    }

    // Check if any of these vehicles are already registered in ANY company!
    const existingMappings = await CompanyCarMap.findAll({
      where: { vehicle_id: existingIds },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'company_name'] },
        { model: VehicleInfo, as: 'vehicle', attributes: ['id', 'vehicle_no'] },
      ],
    });

    if (existingMappings.length > 0) {
      const alreadyRegisteredVehicles = existingMappings.map((m) => ({
        vehicle_id: Number(m.vehicle_id),
        vehicle_no: m.vehicle ? m.vehicle.vehicle_no : null,
        registered_company_id: Number(m.company_id),
        registered_company_name: m.company ? m.company.company_name : null,
      }));

      const alreadyMappedIds = alreadyRegisteredVehicles.map((item) => item.vehicle_id);
      const newVehicleIds = existingIds.filter((vId) => !alreadyMappedIds.includes(vId));

      // If all provided vehicles are already mapped to a company:
      if (newVehicleIds.length === 0) {
        const first = alreadyRegisteredVehicles[0];
        const errorMsg =
          alreadyRegisteredVehicles.length === 1
            ? `Vehicle ${first.vehicle_no ? `"${first.vehicle_no}"` : `ID ${first.vehicle_id}`} is already registered with company "${first.registered_company_name || `ID ${first.registered_company_id}`}". It cannot be registered again until it is deleted from that company.`
            : 'All provided vehicles are already registered to companies. They cannot be registered again until deleted from their respective companies.';

        return res.status(409).json({
          success: false,
          message: errorMsg,
          already_registered_vehicles: alreadyRegisteredVehicles,
          missing_vehicle_ids: missingVehicleIds,
        });
      }

      // If only some vehicles can be registered:
      const records = newVehicleIds.map((vId) => ({
        company_id,
        vehicle_id: vId,
        status: status !== undefined ? Number(status) : 1,
      }));
      const created = await CompanyCarMap.bulkCreate(records);

      return res.status(201).json({
        success: true,
        message: `Company-vehicle mappings created for ${created.length} vehicle(s). Some vehicles were skipped because they are already registered with another company.`,
        created_count: created.length,
        skipped_already_registered: alreadyRegisteredVehicles,
        missing_vehicle_ids: missingVehicleIds,
        data: created,
      });
    }

    // None are mapped anywhere, proceed to create mappings
    const records = existingIds.map((vId) => ({
      company_id,
      vehicle_id: vId,
      status: status !== undefined ? Number(status) : 1,
    }));
    const created = await CompanyCarMap.bulkCreate(records);

    return res.status(201).json({
      success: true,
      message: 'Company-vehicle mappings created successfully',
      created_count: created.length,
      missing_vehicle_ids: missingVehicleIds,
      data: created,
    });
  } catch (error) {
    console.error('Create CompanyVehicleMap error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create mapping', error: error.message });
  }
};

// Get all vehicles available for company registration (excluding vehicles currently registered in any company)
exports.getAvailableVehicles = async (req, res) => {
  try {
    const { status, search } = req.query;

    // 1. Get all vehicle IDs currently mapped to any company
    const mappedRecords = await CompanyCarMap.findAll({
      attributes: ['vehicle_id'],
      raw: true,
    });

    const mappedVehicleIds = [...new Set(mappedRecords.map((m) => Number(m.vehicle_id)).filter((id) => id > 0))];

    // 2. Query VehicleInfo excluding all currently mapped vehicle IDs
    const filter = {};
    if (mappedVehicleIds.length > 0) {
      filter.id = { [Op.notIn]: mappedVehicleIds };
    }
    if (status !== undefined) {
      filter.status = Number(status);
    }
    if (search) {
      filter.vehicle_no = { [Op.like]: `%${search}%` };
    }

    const availableVehicles = await VehicleInfo.findAll({
      where: filter,
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          required: false,
        },
        {
          model: VehicleImage,
          as: 'images',
          required: false,
        },
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Available vehicles for company registration fetched successfully',
      total: availableVehicles.length,
      currently_mapped_count: mappedVehicleIds.length,
      data: availableVehicles,
    });
  } catch (error) {
    console.error('Get available vehicles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available vehicles',
      error: error.message,
    });
  }
};

// Get all mappings with optional filters
exports.getAllCompanyVehicleMaps = async (req, res) => {
  try {
    const { company_id, vehicle_id, status, available, unmapped } = req.query;

    // Support getting available/unmapped vehicles via query flag (?available=true)
    if (available === 'true' || unmapped === 'true') {
      return exports.getAvailableVehicles(req, res);
    }

    const filter = {};
    if (company_id) filter.company_id = company_id;
    if (vehicle_id) filter.vehicle_id = vehicle_id;
    if (status !== undefined) filter.status = Number(status);

    const mappings = await CompanyCarMap.findAll({
      where: filter,
      include: [
        { model: Company, as: 'company' },
        {
          model: VehicleInfo,
          as: 'vehicle',
          include: [
            {
              model: Category,
              as: 'categories',
              through: { attributes: [] },
              required: false,
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
    });

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
    const mapping = await CompanyCarMap.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: VehicleInfo, as: 'vehicle' },
      ],
    });
    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }
    return res.status(200).json({ success: true, message: 'Mapping fetched', data: mapping });
  } catch (error) {
    console.error('Get CompanyVehicleMap by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch mapping', error: error.message });
  }
};

// Delete mapping by ID (frees up the vehicle so it can be registered again)
exports.deleteCompanyVehicleMap = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await CompanyCarMap.findByPk(id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'company_name'] },
        { model: VehicleInfo, as: 'vehicle', attributes: ['id', 'vehicle_no'] },
      ],
    });

    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }

    const vehicleNo = mapping.vehicle ? mapping.vehicle.vehicle_no : `ID ${mapping.vehicle_id}`;
    const companyName = mapping.company ? mapping.company.company_name : `ID ${mapping.company_id}`;
    const freedVehicleId = mapping.vehicle_id;

    await mapping.destroy();

    return res.status(200).json({
      success: true,
      message: `Vehicle ${vehicleNo} has been removed from company ${companyName}. It is now available for registration again.`,
      freed_vehicle_id: freedVehicleId,
    });
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
    const mappings = await CompanyCarMap.findAll({
      where: { company_id },
      include: [
        {
          model: VehicleInfo,
          as: 'vehicle',
          include: [
            {
              model: Category,
              as: 'categories',
              through: { attributes: [] },
              required: false,
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
    });
    return res.status(200).json({ success: true, message: 'Vehicles for company fetched', total: mappings.length, data: mappings });
  } catch (error) {
    console.error('Get vehicles by company error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicles', error: error.message });
  }
};
