const { Schema, model } = require('mongoose')

const schema = new Schema({
    _id: { type: Number, required: true, unique: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    img: { type: String, required: true },
    link: { type: String, required: true },
    grade: { type: String },
    class: { type: String },
    subtype: { type: String },
    armorSlot: { type: String },
    recipeLvl: { type: String },
    modification: { type: String }
})

module.exports = model('Item', schema)