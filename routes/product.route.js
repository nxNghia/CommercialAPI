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

router.post('/discard', async (req, res) => {
    const product_id = req.body.product_id
    const quantity = req.body.quantity

    try
    {
        const result = await pool.query(`SELECT * FROM product WHERE id=${product_id} ORDER BY quantity DESC`)

        const warehouses = result.rows.map(row => ({ warehouse_id: row.warehouse_id, quantity: row.quantity }))
        warehouses.push({ warehouse_id: -1, quantity: 0 })

        const converted_arr = warehouses.map(warehouse => ({ warehouse_id: warehouse.warehouse_id, quantity:  warehouses[0].quantity - warehouse.quantity }))
        
        let sum = 0
        let max_columns = 0
        let last_value = 0
        let current_sum = 0

        //find minimum warehouses to get enough products
        converted_arr.every((warehouse, index) => {
            sum += (warehouse.quantity - last_value) * index

            last_value = warehouse.quantity

            if (sum >= quantity)
            {
                max_columns = index
                return false
            }

            return true
        })

        if (sum < quantity)
        {
            res.status(400).send({ message: 'Insufficent quantity', required_quantity: quantity, available_quantity: sum })
        }else{
            const tt = warehouses.reduce((current_value, next_value, current_index) =>
                        current_index > max_columns ? current_value + 0 : current_value + next_value.quantity - warehouses[max_columns].quantity, 0)

            warehouses.every((warehouse, index) => {
                if (index === max_columns)
                    return false

                if (current_sum + Math.floor((warehouse.quantity - warehouses[max_columns].quantity) / tt * quantity) + 1 >= quantity)
                {
                    warehouse.quantity -= (quantity - current_sum)
                    return false
                }else{
                    if (Math.floor((warehouse.quantity - warehouses[max_columns].quantity) / tt * quantity) + 1 > warehouse.quantity)
                    {
                        current_sum += warehouse.quantity
                        warehouse.quantity = 0
                    }else{
                        current_sum += Math.floor((warehouse.quantity - warehouses[max_columns].quantity) / tt * quantity) + 1
                        warehouse.quantity -= Math.floor((warehouse.quantity - warehouses[max_columns].quantity) / tt * quantity) + 1
                    }
                }

                return true
            })

            const update_list = []
            
            warehouses.splice(-1)

            warehouses.forEach(warehouse => {
                const update_promise = new Promise((resolve, reject) => {
                    pool.query(`UPDATE product SET quantity=${warehouse.quantity} WHERE warehouse_id=${warehouse.warehouse_id} AND id=${product_id}`).then(result3 => {
                        resolve(result3)
                    })
                })

                update_list.push(update_promise)
            })

            Promise.all(update_list).then(() => res.status(200).send({ message: 'Success', products_left: warehouses }))
        }
    }catch(err)
    {
        res.status(400).send({ message: 'Failed', error: {...err} })
    }
})

router.post('/remove', async (req, res) => {
    const product_id = req.body.product_id

    try
    {
        const result = await pool.query(`SELECT id, SUM(quantity) AS quantity FROM product GROUP BY id HAVING id=${product_id};
                                        DELETE FROM product WHERE id=${product_id} AND EXISTS (SELECT id, SUM(quantity) AS quantity FROM product
                                        GROUP BY id HAVING id=${product_id} AND SUM(quantity)=0)`)
        
        if (result[1].rowCount !== 0)
        {
            res.status(200).send({ message: 'Success' })
        }else{
            if (result[0].rowCount === 0)
            {
                res.status(400).send({ message: 'Invalid product id', id: product_id })
            }else{
                res.status(400).send({ message: 'Quantity of product is not 0', quantity: result[0].rows[0].quantity })
            }
        }  
    }catch(err)
    {
        res.status(400).send({ message: 'Failed' })
    }
})

module.exports = router