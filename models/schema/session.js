const mongoose = require('mongoose');

const Session = new mongoose.Schema({
    user : { type: String },
    client : {},
    access: { type: String },
    refresh : { type: String },
    issued : { type: String, default: Date },
    expiration : { type: String, default: 0 }
}, { collection: '_session', versionKey: false });

Session.statics.create = function(data){
    const sess = new this(data);
    
    return sess.save();
}

Session.statics.findOneByToken = function(refresh){
    return this.findOne({
        refresh : refresh
    }).exec()
}

Session.methods.verify = function(client, user, access){
    if(this.client != JSON.stringify(client)){
        throw new Error('Clients are different')
    }

    if(this.user != user){
        throw new Error('The user ID is different')
    }

    if(this.access != access){
        throw new Error('Access Token is different')
    }

    return true
}

Session.methods.update = function(token){
    this.access = token.access;
    this.issued = new Date;

    return this.save();
}

module.exports = mongoose.model('Session', Session, true)
