const expess = require('express')

const router = expess.Router()
const pool = require('../database')

const convertDate = (date) => {
    const _date = new Date(date)

    return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear()
}

// for transferring reason, this api return information of particular product that stored in other warehouses
router.get('/:id', async (req, res) => {
    const product_id = req.params.id

    const result = await pool.query(`SELECT P.id, P.quantity, P.warehouse_id, W.name, P.last_update FROM product AS P, warehouse AS W
        WHERE P.id='${product_id}' AND P.warehouse_id = W.id`)
    
    const list = result?.rows.map(item => ({...item, last_update: convertDate(item.last_update)}))
    res.status(200).send(list)
})

const reasonConstances = {
    1: 'Không nguyên vẹn',
    2: 'Không nhận hàng',
    3: 'Đổi hàng'
}

// get information about returned product 
router.get('/returned', async (req, res) => {
    const result = await pool.query(`SELECT * FROM return ORDER BY date DESC`)
    
    const returnedList = []
    result?.rows.forEach(product => {
        returnedList.push({
            product_id: product.product_id,
            return_to: product.return_to,
            reason: {
                value: product.reason,
                text: reasonConstances[product.reason]
            },
            quantity: product.quantity,
            date: convertDate(product.date)
        })
    });

    res.status(200).send(returnedList)
})

// get total quantity of each product, which is stored in every warehouse
router.get('/', async (req, res) => {
    try
    {
        const result = await pool.query(`SELECT id, SUM(quantity) as quantity FROM product GROUP BY id`)
    
        res.send(result.rows)
    }catch (err)
    {
        res.send(err)
    }
})

module.exports = router