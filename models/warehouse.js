class Warehouse {
    constructor(sqlite) {
        this.sqlite = sqlite
    }

    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS warehouse (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT)`

        return this.sqlite.runquery(sql)
    }

    insertTable(id, name) {
        return this.sqlite.runquery(`INSERT INTO warehouse (id, name) VALUES (?, ?)`, [id, name])
    }

    selectTable() {
        return this.sqlite.all(`SELECT * FROM warehouse`)
    }
}

module.exports = Warehouse