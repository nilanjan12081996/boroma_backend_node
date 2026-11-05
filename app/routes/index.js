const express = require('express')

const router = express.Router()

const CategoryRoutes = require('./category/category.routes')
const AdminRoutes = require('./admin/admin.routes')
const VehicleInfoRoutes = require('./vehicle_info/vehicle_info.routes')
const VehicleImageRoutes = require('./vehicle_image/vehicle_image.routes')
const CategoryVehicleMapRoutes = require('./category_vehical_map/category_vehical_map.routes')
const CompanyRoutes = require('./company/company.routes')
const CompanyCarMapRoutes = require('./company_car_maps/company_car_maps.routes')
const VehiclePermitRoutes = require('./vehicle_permit/vehicle_permit.routes')
const VehiclePollutionRoutes = require('./vehicle_pollution/vehicle_pollution.routes')
const VehicleTaxRoutes = require('./vehicle_tax/vehicle_tax.routes')
const VehicleFitnessRoutes = require('./vehicle_fitness/vehicle_fitness.routes')
const DriverRoutes = require('./driver/driver.routes')
const DriverDetailsRoutes = require('./driver_details/driver_details.routes')

router.use('/category', CategoryRoutes)

router.use('/admin', AdminRoutes)
router.use('/api/admin', AdminRoutes)

router.use('/vehicle-info', VehicleInfoRoutes)

router.use('/vehicle-image', VehicleImageRoutes)

router.use('/category-vehicle-map', CategoryVehicleMapRoutes)
router.use('/category-vehical-map', CategoryVehicleMapRoutes)

router.use('/company', CompanyRoutes)
router.use('/company-car-map', CompanyCarMapRoutes)

router.use('/vehicle-permit', VehiclePermitRoutes)

router.use('/vehicle-pollution', VehiclePollutionRoutes)
router.use('/vehicle-polution', VehiclePollutionRoutes)
router.use('/vehical-polution', VehiclePollutionRoutes)

router.use('/vehicle-tax', VehicleTaxRoutes)
router.use('/vehical-tax', VehicleTaxRoutes)

router.use('/vehicle-fitness', VehicleFitnessRoutes)
router.use('/vehical-fitness', VehicleFitnessRoutes)

router.use('/driver', DriverRoutes)
router.use('/drivers', DriverRoutes)

router.use('/driver-details', DriverDetailsRoutes)
router.use('/driver-detail', DriverDetailsRoutes)

module.exports = router
