const pool = require('../database')
const productAPI = require('../api/product')

const getById = async (product_id) => {
    const result = await pool.query(`SELECT P.id, P.quantity, P.warehouse_id, W.name, P.last_update FROM product AS P, warehouse AS W
            WHERE P.id=${product_id} AND P.warehouse_id = W.id`)

    return result
}

const getReturn = async () => {
    const result = await pool.query(`SELECT * FROM "return" ORDER BY date DESC`)
    
    return result
}

const get = async () => {
    const result = await pool.query(`SELECT id, SUM(quantity) as quantity FROM product GROUP BY id`)

    return result.rows
}

const add = async (product_id, quantity, to) => {
    const result = await pool.query(`UPDATE product SET quantity=quantity+${quantity}, last_update=current_date WHERE id=${product_id} AND warehouse_id=${to};
                                        INSERT INTO product (id, warehouse_id, quantity, last_update) SELECT ${product_id}, ${to}, ${quantity}, current_date
                                        WHERE NOT EXISTS (SELECT 1 FROM product WHERE id=${product_id} AND warehouse_id=${to});
                                        SELECT * FROM product WHERE id=${product_id} AND warehouse_id=${to}`)

    return result
}

const update = async (product_id, quantity, to) => {
    const result = await pool.query(`UPDATE product SET quantity=quantity+${quantity}, last_update=current_date WHERE id=${product_id} AND warehouse_id=${to};
                                                    INSERT INTO product (id, warehouse_id, quantity, last_update) SELECT ${product_id}, ${to}, ${quantity}, current_date
                                                    WHERE NOT EXISTS (SELECT 1 FROM product WHERE id=${product_id} AND warehouse_id=${to});
                                                    SELECT * FROM product WHERE id='${product_id}' AND warehouse_id=${to}`)
    return result
}

const discard = async (warehouse, product_id) => {
    const result = await pool.query(`UPDATE product SET quantity=${warehouse.quantity} WHERE warehouse_id=${warehouse.warehouse_id} AND id=${product_id}`)

    return result
}

const remove = async (product_id) => {
    const result = await pool.query(`SELECT id, SUM(quantity) AS quantity FROM product GROUP BY id HAVING id=${product_id};
                                        DELETE FROM product WHERE id=${product_id} AND EXISTS (SELECT id, SUM(quantity) AS quantity FROM product
                                        GROUP BY id HAVING id=${product_id} AND SUM(quantity)=0)`)
    
    return result
}

const getInformation = async (product_id) => {
    const result1 = await productAPI.api11(product_id)
    if (result1)
        return result1
    else{
        const result2 = await productAPI.api17(product_id)
        return result2[0]
    } 
}

const queryExec = async (query) => {
    const result = await pool.query(query)

    return result
}

module.exports = {
    getById,
    getReturn,
    get,
    add,
    update,
    discard,
    remove,
    getInformation,
    queryExec
}