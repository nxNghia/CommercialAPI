require('dotenv').config()
const express = require('express')
const cors = require('cors')

const productRouter = require('./routes/product.route')
const warehouseRouter = require('./routes/warehouse.route')

const port = process.env.PORT || 8000

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: '*'
}))

app.listen(port, () => console.log(`Running on port ${port}`))

app.use('/product', productRouter);
app.use('/warehouse', warehouseRouter);