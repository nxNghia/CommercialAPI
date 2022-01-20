const expess = require('express')
const pool = require('../database')
const axios = require('axios')

const router = expess.Router()

const convertDate = (date) => {
    const _date = new Date(date)

    return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear()
}

// get information of products that are stored in a particular warehouse
router.get('/:warehouse', async (req, res) => {
    try
    {
        const warehouse_id = req.params.warehouse

        if (warehouse_id.includes(' '))
            res.status(400).send({ message: 'Parameter contains space' })

        const result = await pool.query(`SELECT id, quantity, last_update FROM product WHERE warehouse_id=${warehouse_id}`)

        const list = result?.rows.map(item => ({...item, last_update: convertDate(item.last_update)}))
        res.status(200).send(list)
    }catch (err)
    {
        res.status(400).send({ message: "Failed", error: err })
    }
})

// get profit correspond to each warehouse
router.get('/profit/:warehouse', async (req, res) => {
    try
    {
        const warehouse_id = req.params.warehouse

        if (warehouse_id.includes(' '))
            res.status(400).send({ message: 'Parameter contains space' })

        const result = await pool.query(`SELECT product_id, quantity FROM "export" AS E, export_detail WHERE E.from=${warehouse_id} AND E.id = export_detail.export_id`)

        const products = []

        result?.rows.forEach(product => {
            const product_info = new Promise((resolve, reject) => {
                axios.get(`https://laptrinhcautrucapi.herokuapp.com/product/id?id=${product.product_id}`).then(response => {
                    if(response)
                        resolve({...response.data[0], profit: product.quantity * response.data[0].price, quantity: product.quantity})
                    else
                        reject(response.data)
                })
            })

            products.push(product_info)
        })

        Promise.all(products).then(result => res.status(200).send({
            product: result.map(r => ({id: r.id, name: r.name, profit: r.profit, quantity: r.quantity})),
            total: result.reduce((current, next) => {
                return current + next.profit
            }, 0)
        }))
    }catch (err)
    {
        res.status(400).send({ message: 'Failed', error: err })
    }
})

// get information of warehouses
router.get('/', async (req, res) => {
    try
    {
        const result = await pool.query(`SELECT * FROM warehouse`)
    
        const list = result.rows.filter(warehouse => warehouse.id !== 1)

        res.send(list)
    }catch (err)
    {
        res.status(400).send({ message: 'Failed', error: err })
    }
})

module.exports = router