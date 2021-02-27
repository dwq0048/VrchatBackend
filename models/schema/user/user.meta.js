const mongoose = require('mongoose');

const UserMeta = new mongoose.Schema({
    index : { type : mongoose.Schema.Types.ObjectId },
    date : { type : Date , default : Date },
    type : { type : String },
    meta : { type : Object }
}, { collection: 'bd_user_meta', versionKey: false });

UserMeta.statics.create = function(data){
    const data = new this(data);
    
    return data.save();
}


module.exports = mongoose.model('UserMeta', UserMeta, true);
