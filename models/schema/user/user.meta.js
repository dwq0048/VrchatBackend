const mongoose = require('mongoose');

const UserMeta = new mongoose.Schema({
    index : { type : mongoose.Schema.Types.ObjectId },
    date : { type : Date , default : Date },
    type : { type : String },
    meta : { type : Object }
}, { collection: 'gl_user_meta', versionKey: false });

UserMeta.statics.create = function(data){
    const result = new this(data);
    
    return result.save();
}

module.exports = mongoose.model('UserMeta', UserMeta, true);
