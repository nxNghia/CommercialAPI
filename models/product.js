class Product {
    constructor(sqlite) {
        this.sqlite = sqlite
    }

    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS product (
            id INTEGER,
            warehouseid INTEGER,
            quantity INTEGER)`

        return this.sqlite.runquery(sql)
    }

    insertTable(id, warehouse, quantity) {
        const sql = `INSERT INTO product VALUES (${id}, ${warehouse}, ${quantity})`

        return this.sqlite.runquery(sql)
    }

    editTable(id, quantity) {
        const sql = `UPDATE product SET quantity=${quantity} WHERE id=${id}`

        return this.sqlite.runquery(sql)
    }

    select() {
        const sql = `SELECT * FROM product`

        return this.sqlite.all(sql)
    }

    selectAllTable() {
        const sql = `SELECT id, SUM(quantity) AS quantity FROM product GROUP BY (id)`

        return this.sqlite.all(sql)
    }

    selectByWarehouse(warehouse) {
        const sql = `SELECT * FROM product WHERE warehouse=${warehouse}`

        return this.sqlite.all(sql)
    }

    deleteAll() {
        const sql = `DELETE FROM product`

        return this.sqlite.runquery(sql)
    }
}

module.exports = Product