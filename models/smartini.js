const mongoose = require('mongoose')

const smartiniSchema = new mongoose.Schema({
  question:  { type: String, required: true },
  answer:  { type: String, required: true },   
})

const Smartini = mongoose.model('Smartini', smartiniSchema)

module.exports = Smartini