const mongoose = require('mongoose')

const smartiniSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  color:  { type: String, required: true },
  readyToEat: Boolean,
})

const Smartini = mongoose.model('Smartini', smartiniSchema)

module.exports = Smartini