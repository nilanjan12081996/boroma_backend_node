const express=require('express')

const router=express.Router()

const CategoryRoutes= require('./category/category.routes')
const AdminRoutes= require('./admin/admin.routes')
const VehicleInfoRoutes = require('./vehicle_info/vehicle_info.routes')
const VehicleImageRoutes = require('./vehicle_image/vehicle_image.routes')

router.use('/category',CategoryRoutes)
router.use('/api/admin',AdminRoutes)
router.use('/vehicle-info', VehicleInfoRoutes)
router.use('/vehicle-image', VehicleImageRoutes)


module.exports=router
