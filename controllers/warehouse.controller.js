const Warehouse = require('../models/warehouse.model')
const Product = require('../models/product.model')

const convertDate = (date) => {
    const _date = new Date(date)

    return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear()
}

const getWarehouseById = async (request, response, next) => {
    try
    {
        const warehouse_id = request.params.warehouse

        if (warehouse_id.includes(' '))
            res.status(400).send({ message: 'Parameter contains space' })

        const result = await Warehouse.getById(warehouse_id)

        const list = result?.rows.map(item => ({...item, last_update: convertDate(item.last_update)}))
        response.status(200).send(list)
    }catch (err)
    {
        response.status(400).send({ message: "Failed", error: err })
    }
}

const getWarehouseProfit = async (request, response, next) => {
    try
    {
        const warehouse_id = request.params.warehouse

        if (warehouse_id.includes(' '))
            response.status(400).send({ message: 'Parameter contains space' })

        const result = await Warehouse.getProfit(warehouse_id)

        const products = []

        result?.rows.forEach(product => {
            const product_info = new Promise(async (resolve, reject) => {

                const info = await Product.getInformation(product.product_id)
                resolve({...info.data[0], profit: product.quantity * info.data[0].price, quantity: product.quantity})
            })

            products.push(product_info)
        })

        Promise.all(products).then(result => response.status(200).send({
            product: result.map(r => ({id: r.id, name: r.name, profit: r.profit, quantity: r.quantity})),
            total: result.reduce((current, next) => {
                return current + next.profit
            }, 0)
        }))
    }catch (err)
    {
        res.status(400).send({ message: 'Failed', error: err })
    }
}

const getWarehouses = async (request, response, next) => {
    try
    {
        const result = await Warehouse.get()
    
        const list = result.rows.filter(warehouse => warehouse.id !== 1)

        response.send(list)
    }catch (err)
    {
        response.status(400).send({ message: 'Failed', error: err })
    }
}

module.exports = {
    getWarehouses,
    getWarehouseById,
    getWarehouseProfit
}