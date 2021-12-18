const mongoose = require('mongoose')

const importHistorySchema = new mongoose.Schema({
    products: mongoose.Schema.Types.Array,
    date: mongoose.Schema.Types.Date
})

const ImportHistory = mongoose.model('ImportHistory', importHistorySchema)

module.exports = ImportHistory