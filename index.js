const express = require('express')
const app = express()
const productRouter = require('./routes/route.products')
const historyRouter = require('./routes/route.history')

const port = process.env.PORT || 8000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.listen(port, () => console.log(`Running on port ${port}`))

app.use('/products', productRouter)
app.use('/history', historyRouter)