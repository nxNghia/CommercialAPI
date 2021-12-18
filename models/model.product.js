const mongoose = require('mongoose')

const productsSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
})

const Product = mongoose.model('Products', productsSchema)

module.exports = Product