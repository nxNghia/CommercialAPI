const express = require('express')
const mongoose = require('mongoose')

const productRouter = require('./routes/route.products')
const historyRouter = require('./routes/route.history')

const port = process.env.PORT || 8000
const mongoURL = process.env.MONGOURL || 'mongodb://localhost:27017/CommercialAPI'

try {
    mongoose.connect(
        mongoURL,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
}catch{
    console.log('failed')
}

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.listen(port, () => console.log(`Running on port ${port}`))

app.use('/products', productRouter)
app.use('/history', historyRouter)