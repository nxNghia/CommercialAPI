const mysql = require('mysql')

const con = mysql.createConnection({
    host: 'ltct.cws03zhgrjni.ap-southeast-1.rds.amazonaws.com',
    user: 'root',
    password: '123456789',
    database: 'it4492_2',
    port: 3306
    // host: 'sql6.freesqldatabase.com',
    // user: 'sql6462262',
    // password: 'K1JKyt4uFq',
    // database: database
})

//phpmyadmin: http://www.phpmyadmin.co

con.connect(err => {
    if (err) throw err

    console.log("connected")
})

module.exports = {
    con
}

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