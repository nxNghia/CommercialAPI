const expess = require('express')

const router = expess.Router()
const ProductController = require('../controllers/product.controller')

router.get('/getById/:id', ProductController.productGetById)
router.get('/returned', ProductController.productReturned)
router.get('/', ProductController.productsGet)
router.post('/add', ProductController.productAdd)
router.post('/update', ProductController.productUpdate)
router.post('/discard', ProductController.productDiscard)
router.post('/remove', ProductController.productRemove)

module.exports = router