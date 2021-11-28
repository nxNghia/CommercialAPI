const express = require('express')

const router = express.Router()

const histories = require('../models/model.history')

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

module.exports = router