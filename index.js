const express = require('express')
const cors = require('cors')
const { con } = require('./database')
const axios = require('axios')

const port = process.env.PORT || 8000

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: '*'
}))

app.listen(port, () => console.log(`Running on port ${port}`))

const convertDate = (date) => {
    const _date = new Date(date)

    return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear()
}

app.get('/statistics/storage/:storage', (req, res) => {
    const storage_id = req.params.storage

    con.query(`SELECT * FROM product WHERE warehouse_id=${storage_id}`, (err, result) => {
        const list = result?.map(item => ({...item, last_update: convertDate(item.last_update)}))
        res.status(200).send(list)
    })
})

app.get('/statistics/product/:id/:storage', (req, res) => {
    const product_id = req.params.id
    const storage_id = req.params.storage

    con.query(`SELECT P.id, P.quantity, P.warehouse_id, W.name, P.last_update FROM product AS P, warehouse AS W
        WHERE P.id='${product_id}' AND P.warehouse_id!=${storage_id} AND P.warehouse_id = W.id`, (err, result) => {
        const list = result?.map(item => ({...item, last_update: convertDate(item.last_update)}))
        res.status(200).send(list)
    })
})

const reasonConstances = {
    1: 'Không nguyên vẹn',
    2: 'Không nhận hàng',
    3: 'Đổi hàng'
}

//Thông tin những hàng bị trả lại
app.get('/statistics/product/returned', (req, res) => {
    con.query(`SELECT * FROM return ORDER BY date DESC`, (err, result) => {
        const returnedList = []
        result?.forEach(product => {
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
    })
})

//Thống kê doanh thu theo kho
app.get('/statistics/profit/:storage', (req, res) => {
    const storage_id = req.params.storage
    con.query(`SELECT product_id, quantity FROM it4492_2.export AS E, export_detail WHERE E.from=${storage_id} AND E.to=1 AND E.id = export_detail.export_id`, (err, result) => {
            const products = []

            result?.forEach(product => {
                const product_info = new Promise((resolve, reject) => {
                    axios.get(`https://laptrinhcautrucapi.herokuapp.com/product/id?id=${product.product_id}`).then(response => {
                        if(response)
                            resolve({...response.data[0], profit: product.quantity * response.data[0].price})
                        else
                            reject(response.data)
                    })
                })

                products.push(product_info)
            })

            Promise.all(products).then(result => res.status(200).send({
                product: result.map(r => ({id: r.id, name: r.name, profit: r.profit})),
                total: result.reduce((current, next) => {
                    console.log(current, next)
                    return current + next.profit
                }, 0)
            }))
        })
})

app.get('/storage', (req, res) => {
    con.query(`SELECT * FROM warehouse`, (err, result) => {
        const list = result.filter(storage => storage.id !== 1)

        res.send(list)
    })
})

app.get('/statistics/product', (req, res) => {
    con.query(`SELECT id, SUM(quantity) as quantity FROM product GROUP BY id`, (err, result) => {
        res.send(result)
    })
})

app.post('/product/add', (req, res) => {
    const new_product = {
        id: req.body.id,
        name: req.body.name,
        type: req.body.type,
        price: req.body.price,
        description: req.body.description,
        size: req.body.size,
        image: req.body.image,
        video: req.body.video,
        color: req.body.color,
        quantity: req.body.quantity,
    }

    const warehouse_id = req.body.warehouse

    axios.put('https://laptrinhcautrucapi.herokuapp.com/product/add_product', new_product).then(response => {
        if(response.data.message === "Successfully Added")
        {
            con.query(`SELECT * FROM product WHERE warehouse_id=${warehouse_id}`).then((err, result) => {
                if(!result || result.length === 0)
                {
                    con.query(`INSERT INTO product (id, warehouse_id, quantity, last_update) VALUES (${new_product.id}, ${warehouse_id}, ${new_product.quantity}, current_date())`).then((err, result) => {
                        if(err)
                        {
                            res.status(200).send({ message: "Failed to add into storage" })
                        }else{
                            res.status(200).send({ message: "Success" })
                        }
                    })
                }else{
                    con.query(`UPDATE product SET quantity=quantity+${new_product.quantity} WHERE id=${new_product.id} AND warehouse_id=${warehouse_id}`).then((err, result) => {
                        if(err)
                        {
                            res.status(200).send({ message: "Failed to add into storage" })
                        }else{
                            res.status(200).send({ message: "Success" })
                        }
                    })
                }
            })
        }else{
            res.status(200).send({ message: "Something wrong happened with product module" })
        }
    })
})