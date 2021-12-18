const express = require('express')

const router = express.Router()

const histories = require('../models/model.exportHistory')
const Product = require('../models/model.product')

router.get('/', (request, response) => {
    Product.find().then(res => {
        response.status(200).send({result_length: res.length, products: {...res}})
    })
})

router.get('/id/:id', (request, response) => {
    const id = request.params.id

    Product.find({ _id: id }).then(res => {
        response.status(200).send({result_length: res.length, products: {...res}})
    })
})

router.get('/min_price/:min_price', (request, response) => {
    const min_price = request.params.min_price

    Product.find({price: { $gte: min_price }}).then(res => {
        response.status(200).send({result_length: res.length, products: {...res}})
    })
})

router.get('/max_price/:max_price', (request, response) => {
    const max_price = request.params.max_price

    Product.find({price: { $lte: max_price }}).then(res => {
        response.status(200).send({result_length: res.length, products: {...res}})
    })
})

router.get('/min_price/:min_price/max_price/:max_price', (request, response) => {
    const max_price = request.params.max_price
    const min_price = request.params.min_price

    Product.find({price: { $lte: max_price, $gte: min_price }}).then(res => {
        response.status(200).send({result_length: res.length, products: {...res}})
    })
})

router.get('/name/:name', (request, response) => {
    const params = request.params.name.split(',')
    
    Product.find().then(res => {
        const products = res.filter(r => params.includes(r.name))
        response.status(200).send({result_length: products.length, ...products})
    })
})

router.post('/add', (request, response) => {
    const new_product = request.body

    //check name
    Product.findOne({ name: new_product.name }).then(res => {
        if (res)
        {
            response.status(200).send({message: 'Product name duplicated', ...res._doc})
        }else{
            const new_product_instance = new Product(new_product)
            new_product_instance.save((err, result) => {
                response.status(200).send({message: 'Success', ...result._doc})
            })
        }
    })
})

router.post('/remove', (request, response) => {
    const id = request.body.id

    Product.deleteOne({ _id: id }).then((err, result) => {
        response.status(200).send(result)
    })
})

module.exports = router