const express = require('express')

const router = express.Router()

const exportHistory = require('../models/model.exportHistory')
const importHistory = require('../models/model.importHistory')
const products = require('../models/model.product')

router.get('/date/:date', (request, response) => {
    // const date = new Date(request.params.date) / 1000
    // const result = []
    // console.log(date)
    
    // histories.forEach( history => {
    //     const _date = new Date(history.date) / 1000
    //     console.log(_date)
    //     if ( date == _date )
    //     {
    //         console.log(history)
    //         result.push(history)
    //     }
    // } )

    // response.send(result)

})

router.get('/date/year/:year', (request, response) => {
    // const year = new Date(request.params.year).getFullYear()
    // const result = []

    // histories.forEach( history => {
    //     const _year = new Date(history.date).getFullYear()

    //     if( year == _year )
    //         result.push(history)
    // } )

    // response.send(result)
})

router.get('/date/month/:month', (request, response) => {
    // const month = new Date(request.params.month).getMonth()
    // const result = []

    // histories.forEach( history => {
    //     const _month = new Date(history.date).getMonth()

    //     if( month == _month )
    //         result.push(history)
    // } )

    // response.send(result)
})

router.get('/import', (request, response) => {
    importHistory.find({}).sort({date: -1}).then(result => response.status(200).send(result))
})

router.get('/export', (request, response) => {
    exportHistory.find({}).sort({date: -1}).then(result => response.status(200).send(result))
})

router.post('/create/import', (request, response) => {
    const importProducts = request.body.products
    const promises = []

    importProducts.forEach(product => {
        const new_promise = new Promise((resolve, reject) => {
            products.findOne({ _id: product.id }).then(res => resolve({...res._doc, import_quantity: product.quantity}))
        })

        promises.push(new_promise)
    })

    Promise.all(promises).then(res => {
        const promises2 = []

        res.forEach(product => {
            const new_promise = new Promise((resolve, reject) => {
                products.where({ _id: product._id })
                    .updateOne({ $set: { quantity: product.quantity + product.import_quantity } })
                    .then(_res => resolve(_res))
            })

            promises2.push(new_promise)
        })

        Promise.all(promises2).then(() => {
            const new_import_record = new importHistory({
                products: res.map(product => ({
                    id: product._id,
                    name: product.name,
                    import_quantity: product.import_quantity,
                    remain_quantity: product.import_quantity + product.quantity
                })),
                date: new Date()
            })

            new_import_record.save((err, result) => response.status(200).send({message: "Success", ...result._doc}))
        })
    })
})

router.post('/create/export', (request, response) => {
    const exportProducts = request.body.products
    const promises = []

    exportProducts.forEach(product => {
      const new_promise = new Promise((resolve, reject) => {
          products.findOne({ _id: product.id }).then(res => resolve({...res._doc, export_quantity: product.quantity}))
      })

      promises.push(new_promise)
    })

    
    Promise.all(promises).then(res => {
        if(res.some(item => item.quantity < item.export_quantity))
        {
            const insufficientProducts = res.filter(_item => _item.quantity < _item.export_quantity)
            
            response.status(200).send({message: "Insufficient number", insufficientProducts: insufficientProducts})
        }else{
            const promises2 = []
            res.forEach(product => {
                const new_promise = new Promise((resolve, reject) => {
                    products.where({ _id: product._id })
                            .updateOne({ $set: { quantity: product.quantity - product.export_quantity } })
                            .then(_res => {
                                resolve(_res)
                            })
                })

                promises2.push(new_promise)
            })

            Promise.all(promises2).then(() => {
                const new_export_record = new exportHistory({
                    products: res.map(product => ({
                        id: product._id,
                        name: product.name,
                        export_quantity: product.export_quantity,
                        remain_quantity: product.quantity - product.export_quantity
                    })),
                    date: new Date()
                })

                new_export_record.save((err, result) => response.status(200).send({message: "Success", ...result._doc}))
            })
        }
    })
})

router.get('/delete/export/:id', (request, response) => {
    const id = request.params.id
    console.log(id)
    exportHistory.deleteOne({ _id: id }).then(result => {
        response.status(200).send(result)
    })
})

router.get('/delete/import/:id', (request, response) => {
    const id = request.params.id
    console.log(id)
    importHistory.deleteOne({ _id: id }).then(result => {
        response.status(200).send(result)
    })
})

module.exports = router