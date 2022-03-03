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

        const list = await Promise.all(result?.rows.map(async (item) => {
            const info = await Product.getInformation(item.id)

            return {...item, last_update: convertDate(item.last_update), name: info.name}
        }))
        response.status(200).send(list)
    }catch (err)
    {
        response.status(400).send({ message: "Failed", ...err })
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
                resolve({...product, profit: product.quantity * info.price, quantity: product.quantity, name: info.name, price: info.price})
            })

            products.push(product_info)
        })

        Promise.all(products).then(result => response.status(200).send({
            product: result.map(r => ({id: r.product_id, name: r.name, profit: r.profit, quantity: r.quantity, price: r.price})),
            total: result.reduce((current, next) => {
                return current + next.profit
            }, 0)
        }))
    }catch (err)
    {
        res.status(400).send({ message: 'Failed', ...err })
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
        response.status(400).send({ message: 'Failed', ...err })
    }
}

module.exports = {
    getWarehouses,
    getWarehouseById,
    getWarehouseProfit
}