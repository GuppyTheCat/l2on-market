const { Schema, model } = require('mongoose')

const schema = new Schema({
    _id: { type: Number, required: true, unique: true },
    itemId: { type: Number, required: true},
    modification: { type: String },
    enchant: { type: String },
    attribute: { type: Map, of: Number },
    price: { type: Number, required: true},
    lastSeen: { type: Number, required: true},
    town: { type: String },
    quantity: { type: String }
})

module.exports = model('Offer', schema)