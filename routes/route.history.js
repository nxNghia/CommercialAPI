const express = require('express')

const router = express.Router()

const histories = require('../models/model.history')
const products = require('../models/model.product')

router.get('/date/:date', (request, response) => {
    const date = new Date(request.params.date) / 1000
    const result = []
    console.log(date)
    
    histories.forEach( history => {
        const _date = new Date(history.date) / 1000
        console.log(_date)
        if ( date == _date )
        {
            console.log(history)
            result.push(history)
        }
    } )

    response.send(result)
})

router.get('/date/year/:year', (request, response) => {
    const year = new Date(request.params.year).getFullYear()
    const result = []

    histories.forEach( history => {
        const _year = new Date(history.date).getFullYear()

        if( year == _year )
            result.push(history)
    } )

    response.send(result)
})

router.get('/date/month/:month', (request, response) => {
    const month = new Date(request.params.month).getMonth()
    const result = []

    histories.forEach( history => {
        const _month = new Date(history.date).getMonth()

        if( month == _month )
            result.push(history)
    } )

    response.send(result)
})

router.get('/staff/:staff', (request, response) => {
    const result = []

    histories.forEach( history => {
        if(history.staff == request.params.staff)
        {
            result.push(history)
        }
    })

    response.send(result)
})

router.get('/import', (request, response) => {
    const result = []

    histories.forEach( history => {
        if (history.in_out == 1)
            result.push(history)
    } )

    response.send(result)
})

router.get('/export', (request, response) => {
    const result = []

    histories.forEach( history => {
        if (history.in_out == 0)
            result.push(history)
    } )

    response.send(result)
})

router.post('/create/import', (request, response) => {
    const importData = request.body
    const importProducts = [...importData.products]

    if (importProducts) histories.push({id: histories.length + 1, ...importData})

    while(importProducts.length !== 0)
    {
        const new_product = importProducts.shift()
        products.forEach(product => {
            product.types.forEach(type => {
                type.models.every(model => {
                    if(model.id == new_product.id)
                    {
                        new_product.detail.forEach(size => {
                            const index = model.quantities.findIndex(q => q.size == size.size)
                            if(index !== -1)
                            {
                                model.quantities[index].quantity += size.quantity
                            }else{
                                model.quantities.push({ size: size.size, quantity: size.quantity })
                            }
                        })
                        return false
                    }
                    return true
                })
            })
        })
    }

    response.send(products)
})

router.post('/create/export', (request, response) => {
    const importData = request.body
    const importProducts = [...importData.products]

    if (importProducts) histories.push({id: histories.length + 1, ...importData})
    const models = []
    while(importProducts.length !== 0)
    {
        const new_product = importProducts.shift()
        products.forEach(product => {
            product.types.forEach(type => {
                type.models.every(model => {
                    if(model.id == new_product.id && model.quantities.length >= new_product.detail.length)
                    {
                        models.push(model)
                        return false
                    }
                    return true
                })
            })
        })
    }
    let validate = true
    if(models.length === importData.products.length)
    {
        importData.products.forEach((product, index) => {
            product.detail.forEach(d => {
                const index2 = models[index].quantities.findIndex(q => q.size == d.size)
                if (index2 === -1)
                {
                    validate = validate && false
                }else{
                    validate = (models[index].quantities[index2].quantity >= d.quantity)
                }
            })
        })
    }else{
        validate = false
    }

    if(validate)
    {
        importData.products.forEach((product, index) => {
            product.detail.forEach(d => {
                const index2 = models[index].quantities.findIndex(q => q.size == d.size)
                models[index].quantities[index2].quantity -= d.quantity
            })
        })
    }

    response.send({state: validate, ...products})
})

router.post('/delete', (request, response) => {
    const ids = request.body.id

    while(ids.length !== 0)
    {
        const tmp_id = ids.shift()
        const index = histories.findIndex(history => history.id == tmp_id)
        if(index !== -1)
            histories.splice(index, 1)
    }

    response.send(histories)
})

module.exports = router