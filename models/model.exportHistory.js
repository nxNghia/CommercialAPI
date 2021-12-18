const mongoose = require('mongoose')

const exportHistorySchema = new mongoose.Schema({
    products: mongoose.Schema.Types.Array,
    date: mongoose.Schema.Types.Date
})

const ExportHistory = mongoose.model('EmportHistory', exportHistorySchema)

module.exports = ExportHistory