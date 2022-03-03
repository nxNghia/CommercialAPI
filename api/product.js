const axios = require('axios')

const api11 = async (product_id) => {
    try {
        const result = await axios.get(`https://limitless-shelf-91096.herokuapp.com/api/products/${product_id}`)
        return result.data.data
    }catch (err) {
        return null
    }
}

const api17 = async (product_id) => {
    try {
        const result = await axios.get(`https://laptrinhcautrucapi.herokuapp.com/product/id?id=${product_id}`)
        return result.data
    }catch (err) {
        return null
    }
}

const api17getAll = async () => {
    try {
        const result = await axios.get('https://laptrinhcautrucapi.herokuapp.com/product/show')
        return result.data
    }catch (err) {
        return null
    }
}

module.exports = {
    api11,
    api17,
    api17getAll
}