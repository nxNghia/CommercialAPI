const Product = require('../models/product.model')

const convertDate = (date) => {
    const _date = new Date(date)

    return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear()
}

const reasonConstances = {
    1: 'Không nguyên vẹn',
    2: 'Không nhận hàng',
    3: 'Đổi hàng'
}

const productGetById = async (request, response, next) => {
    try
    {
        const product_id = request.params.id

        if (product_id.includes(' '))
            response.status(400).send({ message: "Parameter contains space" })

        const result = await Product.getById(product_id)
        
        const list = result?.rows.map(item => ({...item, last_update: convertDate(item.last_update)}))

        const total = list.reduce((current_value, next_value) => current_value + next_value.quantity, 0)

        response.status(200).send({details: list, total: total})
    }catch (err)
    {
        response.status(400).send({ message: "Failed", error: err })
    }
}

const productReturned = async (request, response, next) => {
    try
    {
        const result = await Product.getReturn()
        // const result = await pool.query(`SELECT * FROM "return" ORDER BY date DESC`)
    
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

        response.status(200).send(returnedList)
    }catch (err) {
        response.status(400).send({ message: "Failed", error: err })
    }
}

const productsGet = async (request, response, next) => {
    try
    {
        const result = await Product.get()
    
        response.send(result.rows)
    }catch (err)
    {
        response.status(400).send({ message: "Failed", error: err })
    }
}

const productAdd = async (request, response, next) => {
    try
    {
        const product_id = request.body.product_id
        const to = request.body.to
        const quantity = request.body.quantity

        const result = await Product.add(product_id, quantity, to)
        // const result = await pool.query(`UPDATE product SET quantity=quantity+${quantity}, last_update=current_date WHERE id=${product_id} AND warehouse_id=${to};
                                        // INSERT INTO product (id, warehouse_id, quantity, last_update) SELECT ${product_id}, ${to}, ${quantity}, current_date
                                        // WHERE NOT EXISTS (SELECT 1 FROM product WHERE id=${product_id} AND warehouse_id=${to});
                                        // SELECT * FROM product WHERE id=${product_id} AND warehouse_id=${to}`)

        response.status(200).send({
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
        response.status(400).send({ message: 'Failed', error: err })
    }
}

const productUpdate = async (request, response, next) => {
    try
    {
        const product_id = request.body.product_id
        const from = request.body.from
        const to = request.body.to
        const quantity = request.body.quantity

        // const result = await pool.query(`SELECT * FROM product WHERE warehouse_id=${from} AND id=${product_id}`)
        const query = `SELECT * FROM product WHERE warehouse_id=${from} AND id=${product_id}`
        const result = await Product.queryExec(query)

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
                const query = `UPDATE product SET quantity=quantity-${quantity} WHERE id=${product_id} AND warehouse_id=${from}`
                const result2 = await Product.queryExec(query)
                // const result2 = await pool.query(`UPDATE product SET quantity=quantity-${quantity} WHERE id=${product_id} AND warehouse_id=${from}`)

                try
                {
                    if(result2.rowCount !== 0)
                    {
                        const result3 = await Product.update(product_id, quantity, to)
                        // const result3 = await pool.query(`UPDATE product SET quantity=quantity+${quantity}, last_update=current_date WHERE id=${product_id} AND warehouse_id=${to};
                                                    // INSERT INTO product (id, warehouse_id, quantity, last_update) SELECT ${product_id}, ${to}, ${quantity}, current_date
                                                    // WHERE NOT EXISTS (SELECT 1 FROM product WHERE id=${product_id} AND warehouse_id=${to});
                                                    // SELECT * FROM product WHERE id='${product_id}' AND warehouse_id=${to}`)
                        
                        response.status(200).send({
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
                    response.status(400).send({ message: 'Failed', error: err })
                }
            }
        }else{
            response.status(400).send({ message: 'Product id is not exist' })
        }
    }catch(err)
    {
        response.status(400).send({ message: 'Failed', error: err })
    }
}

const productDiscard = async (request, response, next) => {
    try
    {
        const product_id = request.body.product_id
        const quantity = request.body.quantity

        // const result = await pool.query(`SELECT * FROM product WHERE id=${product_id} ORDER BY quantity DESC`)
        const query = `SELECT * FROM product WHERE id=${product_id} ORDER BY quantity DESC`
        const result = await Product.queryExec(query)
        
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
            response.status(400).send({ message: 'Insufficent quantity', required_quantity: quantity, available_quantity: sum })
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
                const update_promise = new Promise( async (resolve, reject) => {
                    // pool.query(`UPDATE product SET quantity=${warehouse.quantity} WHERE warehouse_id=${warehouse.warehouse_id} AND id=${product_id}`).then(result3 => {
                    //     resolve(result3)
                    // })

                    const result3 = await Product.discard(warehouse, product_id)
                    resolve(result3)
                })

                update_list.push(update_promise)
            })

            Promise.all(update_list).then(() => response.status(200).send({ message: 'Success', products_left: warehouses }))
        }
    }catch(err)
    {
        response.status(400).send({ message: 'Failed', error: {...err} })
    }
}

const productRemove = async (request, response, next) => {
    try
    {
        const product_id = request.body.product_id

        const result = await Product.remove(product_id)
        // const result = await pool.query(`SELECT id, SUM(quantity) AS quantity FROM product GROUP BY id HAVING id=${product_id};
                                        // DELETE FROM product WHERE id=${product_id} AND EXISTS (SELECT id, SUM(quantity) AS quantity FROM product
                                        // GROUP BY id HAVING id=${product_id} AND SUM(quantity)=0)`)
        
        if (result[1].rowCount !== 0)
        {
            response.status(200).send({ message: 'Success' })
        }else{
            if (result[0].rowCount === 0)
            {
                response.status(400).send({ message: 'Invalid product id', id: product_id })
            }else{
                response.status(400).send({ message: 'Quantity of product is not 0', quantity: result[0].rows[0].quantity })
            }
        }  
    }catch(err)
    {
        response.status(400).send({ message: 'Failed' })
    }
}

module.exports = {
    productGetById,
    productReturned,
    productsGet,
    productAdd,
    productUpdate,
    productDiscard,
    productRemove
}