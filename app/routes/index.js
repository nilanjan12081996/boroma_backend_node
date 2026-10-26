const express = require('express')

const router = express.Router()

const CategoryRoutes = require('./category/category.routes')
const AdminRoutes = require('./admin/admin.routes')
const VehicleInfoRoutes = require('./vehicle_info/vehicle_info.routes')
const VehicleImageRoutes = require('./vehicle_image/vehicle_image.routes')
const CategoryVehicleMapRoutes = require('./category_vehical_map/category_vehical_map.routes')
const CompanyRoutes = require('./company/company.routes')

router.use('/category', CategoryRoutes)

router.use('/admin', AdminRoutes)
router.use('/api/admin', AdminRoutes)

router.use('/vehicle-info', VehicleInfoRoutes)

router.use('/vehicle-image', VehicleImageRoutes)

router.use('/category-vehicle-map', CategoryVehicleMapRoutes)
router.use('/category-vehical-map', CategoryVehicleMapRoutes)

router.use('/company', CompanyRoutes)

module.exports = router
