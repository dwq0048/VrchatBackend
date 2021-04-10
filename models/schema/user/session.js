const mongoose = require('mongoose');

const Session = new mongoose.Schema({
    index : { type : mongoose.Schema.Types.ObjectId },
    client : { type : Object },
    access: { type: String },
    refresh : { type: String },
    issued : { type: String, default: Date },
    expiration : { type: String, default: 0 },
    meta : { type : Object }
}, { collection: '_session', versionKey: false });

module.exports = mongoose.model('Session', Session, true)
