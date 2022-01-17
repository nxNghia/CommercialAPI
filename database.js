const Pool = require('pg').Pool

const devConfig = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`
const proConfig = process.env.DATABSE_URL

const pool = new Pool({
    connectionString: process.env.NODE_ENV === 'production' ? proConfig : devConfig
})

module.exports = pool