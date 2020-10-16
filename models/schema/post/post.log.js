const mongoose = require('mongoose');

const Post = new mongoose.Schema({
    index : { type : mongoose.Schema.Types.ObjectId },
    date : { type : Date , default : Date },
    type : { type : String },
    meta : { type : Object }
}, { collection: 'bd_post_log', versionKey: false });

module.exports = mongoose.model('PostLog', Post, true);
