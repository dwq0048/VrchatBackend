const mongoose = require('mongoose');

const User = new mongoose.Schema({
    index : { type : mongoose.Schema.Types.ObjectId },
    date : { type : Date , default : Date },
    type : { type : String },
    meta : { type : Object }
}, { collection: 'bd_user_meta', versionKey: false });

module.exports = mongoose.model('UserMeta', User, true);
