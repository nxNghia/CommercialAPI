const expess = require('express')
const WarehouseController = require('../controllers/warehouse.controller')

const router = expess.Router()

router.get('/:warehouse', WarehouseController.getWarehouseById)
router.get('/profit/:warehouse', WarehouseController.getWarehouseProfit)
router.get('/', WarehouseController.getWarehouses)

module.exports = router