const mongoose = require('mongoose');

const BoardMeta = new mongoose.Schema({
    date : { type : Date , default : Date },
    type : { type : String },
    meta : { type : Object }
}, { collection: 'bd_meta', versionKey: false });

module.exports = mongoose.model('BoardMeta', BoardMeta, true);
