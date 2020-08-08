const mongoose = require('mongoose')

const smartiniSchema = new mongoose.Schema({
  CreateGame:  { type: String, required: true },
  NewQuestion:  { type: String, required: true },
  CreateQuestion: { type: String, required: true },
  
})

const Smartini = mongoose.model('Smartini', smartiniSchema)

module.exports = Smartini