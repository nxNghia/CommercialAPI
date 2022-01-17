require('dotenv').config()
// const mysql = require('mysql')

// const con = mysql.createConnection({
//     host: 'ltct.cws03zhgrjni.ap-southeast-1.rds.amazonaws.com',
//     user: 'root',
//     password: '123456789',
//     database: 'it4492_2',
//     port: 3306,
//     timeout: 60000
// })

//phpmyadmin: http://www.phpmyadmin.co

// con.connect(err => {
//     if (err) throw err

//     console.log("connected")
// })

// module.exports = {
//     con
// }

// const sqlite3 = require('sqlite3')

// class sqlite {
//     constructor(dbFilePath) {
//         this.db = new sqlite3.Database(dbFilePath, (err) => {
//             if(err)
//             {
//                 console.log('Could not connect to database', err)
//             }else{
//                 console.log('Connected to database')
//             }
//         })
//     }

//     runquery(sql, params = []) {
//         return new Promise((resolve, reject) => {
//             this.db.run(sql, params, function (err) {
//                 if (err) {
//                     console.log('Error running sql ' + sql)
//                     console.log(err)
//                     reject(err)
//                 }else{
//                     resolve({ id: this.lastID })
//                 }
//             })
//         })
//     }

//     get(sql, params = []) {
//         return new Promise((resolve, reject) => {
//             this.db.get(sql, params, (err, result) => {
//                 if (err) {
//                     console.log('Error running sql: ' + sql)
//                     console.log(err)
//                     reject(err)
//                 }else{
//                     resolve(result)
//                 }
//             })
//         })
//     }

//     all(sql, params = []) {
//         return new Promise((resolve, reject) => {
//             this.db.all(sql, params, (err, rows) => {
//                 if (err) {
//                     console.log('Error running sql: ' + sql)
//                     console.log(err)
//                     reject(err)
//                 }else{
//                     resolve(rows)
//                 }
//             })
//         })
//     }
// }

// module.exports = sqlite

const Pool = require('pg').Pool

const devConfig = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`
const proConfig = process.env.DATABSE_URL

const pool = new Pool({
    connectionString: process.env.NODE_ENV === 'production' ? proConfig : devConfig
})

module.exports = pool