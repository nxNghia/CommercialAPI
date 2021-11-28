const express = require('express')

const router = express.Router()

const products = require('../models/model.product')
const histories = require('../models/model.history')

router.get('/', (request, response) => {
    response.send(products)
})

router.get('/id/:id', (request, response) => {
    const result = []
    const params = request.params.id.split(',').map(param => parseInt(param))

    products.forEach( product => {
        if (params.includes( product.id ))
            result.push(product)
    } )

    response.send(result)
})

router.get('/model/:model', (request, response) => {
    const result = []
    const params = request.params.model.split(',').map(param => parseInt(param))

    products.forEach( product => {
        product.types.forEach( type => {
            type.models.forEach( model => {
                if( params.includes( model.id ) )
                {
                    result.push({ brand: product.brand, type: type.name, ...model })
                }
            })
        })
    })

    response.send(result)
})

router.get('/min_price/:min_price', (request, response) => {
    const result = []

    products.forEach( product => {
        product.types.forEach( type => {
            type.models.forEach( model => {
                if (model.price >= request.params.min_price)
                    result.push({brand: product.brand, type: type.name, ...model})
            })
        })
    })

    response.send(result)
})

router.get('/max_price/:max_price', (request, response) => {
    const result = []

    products.forEach( product => {
        product.types.forEach( type => {
            type.models.forEach( model => {
                if (model.price < request.params.max_price)
                    result.push({brand: product.brand, type: type.name, ...model})
            })
        })
    })

    response.send(result)
})

router.get('/min_price/:min_price/max_price/:max_price', (request, response) => {
    const result = []

    products.forEach( product => {
        product.types.forEach( type => {
            type.models.forEach( model => {
                if ( model.price >= request.params.min_price && model.price <= request.params.max_price )
                    result.push({brand: product.brand, type: type.name, ...model})
            })
        })
    })

    response.send(result)
})

router.get('/type/:type', (request, response) => {
    const result = []
    const params = request.params.type.split(',').map(p => p.toUpperCase())

    products.forEach( product => {
        product.types.forEach( type => {
            if (params.reduce( (previousValue, currentValue) => type.name.includes( currentValue ) || previousValue, false))
                result.push({ brand: product.brand, ...type })
        } )
    })

    response.send(result)
})

router.get('/name/:name', (request, response) => {
    const params = request.params.name.split(',').map(p => p.toUpperCase())
    const result = []

    products.forEach(product => {
        product.types.forEach( type => {
            type.models.forEach( model => {
                if ( params.reduce((previousValue, currentValue) => model.name.includes( currentValue ) || previousValue, false))
                    result.push({ brand: product.brand, type: type.name, ...model })
            })
        } )
    })

    response.send(result)
})

router.get('/brand/:brand', (request, response) => {
    const result = []
    const params = request.params.brand.split(',').map(b => b.toUpperCase())

    products.forEach( product => {
        if (params.reduce((previousValue, currentValue) => product.brand.includes( currentValue ) || previousValue, false))
            result.push(product)
    } )

    response.send(result)
})

router.get('/history/:model', (request, response) => {
    const result = []
    const params = request.params.model.split(',').map(p => parseInt(p))

    histories.forEach( history => {
        history.products.forEach( product => {
            if (params.includes( product.id ))
                result.push({input_output: history.in_out, date: history.date, staff: history.staff, ...product})
        } )
    } )

    response.send(result)
})

module.exports = router