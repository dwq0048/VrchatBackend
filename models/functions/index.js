const mongoose = require('mongoose');
const Schema = {
    POST : require('../schema/post/post'),
    USER : require('../schema/user/user'),
    IMAGE : require('../schema/file/image')
};

const ObjectId = mongoose.Types.ObjectId;

const onError = (message) => {
    res.status(401).json({
        state: 'error',
        message: message
    })
}

const POST = {
    Create : (data) => {
        return new Promise((resolve, reject) => {
            try{
                Schema.POST.create(data).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err)
                })
            } catch(err) {
                reject(err);
            }
        })
    },
    Page : (data) => {
        return new Promise((resolve, reject) => {
            try{
                Schema.POST.aggregate([
                    {
                        "$match" : { "board" : data.board }
                    },
                    {
                        "$sort" : { 'state.date': 1 }
                    },
                    {
                        "$skip" : data.page
                    },
                    {
                        "$limit" : data.view
                    },
                    {
                        "$lookup" : {
                            "from" : Schema.USER.collection.name,
                            "localField" : "user",
                            "foreignField" : "_id",
                            "as" : "users"
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : Schema.IMAGE.collection.name,
                            "localField" : "images",
                            "foreignField" : "_id",
                            "as" : "ImageMeta"
                        }
                    },
                ], function(rr,ra){
                    if(ra){
                        resolve(ra)
                    }
                })
            } catch(err){
                reject(err)
            }
        })
    },
    View : (data) => {
        return new Promise((resolve, reject) => {
            try {
                Schema.POST.aggregate([
                    {
                        "$match" : { "_id" : new ObjectId(data.index) }
                    },
                    {
                        "$lookup" : {
                            "from" : Schema.USER.collection.name,
                            "localField" : "user",
                            "foreignField" : "_id",
                            "as" : "users"
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : Schema.IMAGE.collection.name,
                            "localField" : "images",
                            "foreignField" : "_id",
                            "as" : "ImageMeta"
                        }
                    },
                ] , function(rr,ra){
                    if(ra){
                        console.log(ra);
                        resolve(ra);
                    }
                })
            } catch(err) {
                reject(err);
            }
        })
    }
}

const IMAGE = {
    InsertToo : (data) => {
        return new Promise((resolve, reject) => {
            Schema.IMAGE.insertMany(data).then((req) => {
                resolve(req);
            }).catch((err) => {
                reject(err);
            })
        });
    }
}

const HELP = {
    formatDate : (date) => {
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
    
        if (month.length < 2){ month = '0' + month };
        if (day.length < 2){ day = '0' + day };
    
        return [year, month].join('');
    }
}

module.exports = {
    POST, IMAGE, HELP
}