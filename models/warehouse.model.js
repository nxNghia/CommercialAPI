const pool = require('../database')

const getById = async (warehouse_id) => {
    const result = await pool.query(`SELECT id, quantity, last_update FROM product WHERE warehouse_id=${warehouse_id}`)

    return result
}

const getProfit = async (warehouse_id) => {
    const result = await pool.query(`SELECT product_id, quantity FROM "export" AS E, export_detail WHERE E.from=${warehouse_id} AND E.to=1 AND E.id = export_detail.export_id`)

    return result
}

const get = async () => {
    const result = await pool.query(`SELECT * FROM warehouse`)
    
    return result
}

const queryExec = async (query) => {
    const result = await pool.query(query)

    return result
}

module.exports = {
    get,
    getById,
    getProfit,
    queryExec
}