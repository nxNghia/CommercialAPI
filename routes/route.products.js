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

router.post('/add/brand', (request, response) => {
    const new_product = request.body.brand
    const status = true

    const index = products.findIndex(product => product.brand == new_product.brand)
    if(index !== -1)
    {
        products.push({ id: products.length + 1, brand: new_product.brand, types: [] })
    }else{
        status = false
    }

    response.send({ status: status, ...products })
})

router.post('/add/type', (request, response) => {
    const new_product = request.body.type
    const status = true

    const index = products.findIndex(product => product.brand == new_product.brand)
    
    if(index !== -1)
    {
        const index2 = products[index].types.findIndex(type => type.name == new_product.name)
        if(index2 !== -1)
        {
            status = false
        }else{
            products[index].types.push({ name: new_product.name, models: [] })
        }
    }else{
        status = false
    }

    response.send({ status: status, ...products })
})

router.post('/add/model', (request, response) => {
    const new_product = request.body.model
    const status = true

    const index = products.findIndex(product => product.brand == new_product.brand)
    
    if(index !== -1)
    {
        const index2 = products[index].types.findIndex(type => type.name == new_product.name)
        if(index2 !== -1)
        {
            const index3 = products[index].types[index2].models.findIndex(model => model.name == new_product.model_name)
            if(index3 !== -1)
            {
                status = false
            }else{
                products[index].types[index2].models.push(
                { 
                    id: new_product.id,
                    name: new_product.model_name,
                    price: new_product.price,
                    quantities: [...new_product.quantities],
                    image: new_product.image 
                })
            }
        }else{
            const new_model = { 
                id: new_product.id,
                name: new_product.model_name,
                price: new_product.price,
                quantities: [...new_product.quantities],
                image: new_product.image 
            }
            const new_type = {
                name: new_product.type_name,
                models: [new_model],
            }
            products[index].types.push(new_type)
        }
    }else{
        status = false
    }

    response.send({ status: status, ...products })
})

module.exports = router