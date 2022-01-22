const expess = require('express')

const router = expess.Router()
const pool = require('../database')

const convertDate = (date) => {
    const _date = new Date(date)

    return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear()
}

// for transferring reason, this api return information of particular product that stored in other warehouses
router.get('/getById/:id', async (req, res) => {
    try
    {
        const product_id = req.params.id

        if (product_id.includes(' '))
            res.status(400).send({ message: "Parameter contains space" })

        const result = await pool.query(`SELECT P.id, P.quantity, P.warehouse_id, W.name, P.last_update FROM product AS P, warehouse AS W
            WHERE P.id=${product_id} AND P.warehouse_id = W.id`)
        
        const list = result?.rows.map(item => ({...item, last_update: convertDate(item.last_update)}))

        const total = list.reduce((current_value, next_value) => current_value + next_value.quantity, 0)

        res.status(200).send({details: list, total: total})
    }catch (err)
    {
        res.status(400).send({ message: "Failed", error: err })
    }
})

const reasonConstances = {
    1: 'Không nguyên vẹn',
    2: 'Không nhận hàng',
    3: 'Đổi hàng'
}

// get information about returned product 
router.get('/returned', async (req, res) => {
    try
    {
        const result = await pool.query(`SELECT * FROM "return" ORDER BY date DESC`)
    
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
    }catch (err) {
        res.status(400).send({ message: "Failed", error: err })
    }
})

// get total quantity of each product, which is stored in every warehouse
router.get('/', async (req, res) => {
    try
    {
        const result = await pool.query(`SELECT id, SUM(quantity) as quantity FROM product GROUP BY id`)
    
        res.send(result.rows)
    }catch (err)
    {
        res.status(400).send({ message: "Failed", error: err })
    }
})

// router.post('/return', async (req, res) => {
//     try
//     {
//         const product_id = req.body.product_id
//         const customer_id = req.body.customer_id
//         const quantity = req.body.quantity
//         // const desciption = req.body.description
//         const return_to = req.body.return_to

//         const result = await pool.query(`INSERT INTO "return" values ('${product_id}', ${return_to}, ${quantity}, current_date, 1)`)

//         res.send(result)
//     }catch(err)
//     {
//         console.log(err)
//         res.status(400).send({ message: 'Failed' })
//     }
// })

router.post('/add', async (req, res) => {
    try
    {
        const product_id = req.body.product_id
        const to = req.body.to
        const quantity = req.body.quantity

        const result = await pool.query(`UPDATE product SET quantity=quantity+${quantity}, last_update=current_date WHERE id=${product_id} AND warehouse_id=${to};
                                        INSERT INTO product (id, warehouse_id, quantity, last_update) SELECT ${product_id}, ${to}, ${quantity}, current_date
                                        WHERE NOT EXISTS (SELECT 1 FROM product WHERE id=${product_id} AND warehouse_id=${to});
                                        SELECT * FROM product WHERE id=${product_id} AND warehouse_id=${to}`)

        res.status(200).send({
            message: 'Success', 
            product: {
                id: product_id,
                warehouse: to,
                last_quantity: result[2].rows[0].quantity - quantity,
                new_quantity: result[2].rows[0].quantity,
                date: convertDate(result[2].rows[0].last_update)
            }
        })
    }catch(err)
    {
        res.status(400).send({ message: 'Failed', error: err })
    }
})

router.post('/update', async (req, res) => {
    try
    {
        const product_id = req.body.product_id
        const from = req.body.from
        const to = req.body.to
        const quantity = req.body.quantity

        const result = await pool.query(`SELECT * FROM product WHERE warehouse_id=${from} AND id=${product_id}`)

        if(result.rowCount !== 0)
        {
            if(result.rows[0].quantity < quantity)
            {
                res.status(400).send({
                    message: 'Insufficient quantity',
                    require_quantity: quantity,
                    available_quantity: result.rows[0].quantity
                })
            }else{
                const result2 = await pool.query(`UPDATE product SET quantity=quantity-${quantity} WHERE id=${product_id} AND warehouse_id=${from}`)

                try
                {
                    if(result2.rowCount !== 0)
                    {
                        const result3 = await pool.query(`UPDATE product SET quantity=quantity+${quantity}, last_update=current_date WHERE id=${product_id} AND warehouse_id=${to};
                                                    INSERT INTO product (id, warehouse_id, quantity, last_update) SELECT ${product_id}, ${to}, ${quantity}, current_date
                                                    WHERE NOT EXISTS (SELECT 1 FROM product WHERE id=${product_id} AND warehouse_id=${to});
                                                    SELECT * FROM product WHERE id='${product_id}' AND warehouse_id=${to}`)
                        
                        res.status(200).send({
                            message: 'Success',
                            move_quantity: quantity,
                            result: { 
                                move_from: {
                                    warehouse_id: from,
                                    new_quantity: result.rows[0].quantity - quantity
                                },
                                move_to: {
                                    warehouse_id: to,
                                    new_quantity: result3[2].rows[0].quantity
                                }
                            },
                            date: convertDate(result3[2].rows[0].last_update)
                        })
                    }
                }catch(err)
                {
                    res.status(400).send({ message: 'Failed', error: err })
                }
            }
        }
    }catch(err)
    {
        res.status(400).send({ message: 'Failed', error: err })
    }
})

module.exports = router