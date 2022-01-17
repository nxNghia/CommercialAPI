require('dotenv').config()
const express = require('express')
const cors = require('cors')

const axios = require('axios')

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
const pool= require('./database')

app.use('/product', productRouter);
app.use('/warehouse', warehouseRouter);

app.get('/get', async (request, response) => {
    try
    {
        const result = await pool.query("SELECT * FROM menu_item")
        response.status(200).send(result.rows)
    }catch (err) {
        console.log(err)
    }
})