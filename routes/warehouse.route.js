const expess = require('express')
const { con } = require('../database')

const router = expess.Router()

// get information of products that are stored in a particular warehouse
router.get('/:warehouse', (req, res) => {
    const warehouse_id = req.params.warehouse

    con.query(`SELECT * FROM product WHERE warehouse_id=${warehouse_id}`, (err, result) => {
        const list = result?.map(item => ({...item, last_update: convertDate(item.last_update)}))
        res.status(200).send(list)
    })
})

// get profit correspond to each warehouse
router.get('/profit/:warehouse', (req, res) => {
    const warehouse_id = req.params.warehouse
    con.query(`SELECT product_id, quantity FROM it4492_2.export AS E, export_detail WHERE E.from=${warehouse_id} AND E.to=1 AND E.id = export_detail.export_id`, (err, result) => {
            const products = []

            result?.forEach(product => {
                const product_info = new Promise((resolve, reject) => {
                    axios.get(`https://laptrinhcautrucapi.herokuapp.com/product/id?id=${product.product_id}`).then(response => {
                        if(response)
                            resolve({...response.data[0], profit: product.quantity * response.data[0].price})
                        else
                            reject(response.data)
                    })
                })

                products.push(product_info)
            })

            Promise.all(products).then(result => res.status(200).send({
                product: result.map(r => ({id: r.id, name: r.name, profit: r.profit})),
                total: result.reduce((current, next) => {
                    console.log(current, next)
                    return current + next.profit
                }, 0)
            }))
        })
})

// get information of warehouses
router.get('/', (req, res) => {
    con.query(`SELECT * FROM warehouse`, (err, result) => {
        const list = result.filter(warehouse => warehouse.id !== 1)

        res.send(list)
    })
})

module.exports = router