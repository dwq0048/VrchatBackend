const mongoose = require('mongoose');
const Schema = {
    POST : require('../schema/post/post'),
    POST_LOG : require('../schema/post/post.log'),
    COMMENT : require('../schema/post/comment'),
    USER : require('../schema/user/user'),
    IMAGE : require('../schema/file/image')
};

const ObjectId = mongoose.Types.ObjectId;

const POST = {
    Read : {
        Page : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.POST.aggregate([
                        {
                            "$match" : { "board" : data.board }
                        },
                        {
                            "$sort" : { 'state.date_fix' : -1 }
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
                        {
                            "$lookup" : {
                                "from" : Schema.COMMENT.collection.name,
                                "let" : {
                                    "index" : "$_id"
                                },
                                "pipeline" : [
                                    {
                                        "$match" : {
                                            "$expr" : {
                                                "$and" : [
                                                    { "$eq" : [ "$_parent", "$$index" ] }
                                                ]
                                            }
                                        },
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "comment"
                            },
                        },
                        {
                            "$lookup" : {
                                "from" : Schema.POST_LOG.collection.name,
                                "let" : { "index" : "$_id" },
                                "pipeline" : [
                                    {
                                        "$match" : {
                                            "$and" : [
                                                { "$expr" : { "$eq" : [ "$index", "$$index" ] } },
                                                { "type" : 'like' },
                                                { "meta.state" : true },
                                            ]
                                        }
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "like_count"
                            }
                        }
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
                        {
                            "$lookup" : {
                                "from" : Schema.COMMENT.collection.name,
                                "let" : { "index" : "$_id" },
                                "pipeline" : [
                                    {
                                        "$match" : {
                                            "$expr" : {
                                                "$and" : [
                                                    { "$eq" : [ "$_parent", "$$index" ] }
                                                ]
                                            }
                                        },
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "comment"
                            },
                        },
                        {
                            "$lookup" : {
                                "from" : Schema.POST_LOG.collection.name,
                                "let" : { "index" : "$_id" },
                                "pipeline" : [
                                    {
                                        "$match" : {
                                            "$and" : [
                                                { "$expr" : { "$eq" : [ "$index", "$$index" ] } },
                                                { "type" : 'like' },
                                                { "meta.state" : true },
                                                { "meta.user" : new ObjectId(data.user) },
                                            ]
                                        }
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "like_check"
                            }
                        },
                        {
                            "$lookup" : {
                                "from" : Schema.POST_LOG.collection.name,
                                "let" : { "index" : "$_id" },
                                "pipeline" : [
                                    {
                                        "$match" : {
                                            "$and" : [
                                                { "$expr" : { "$eq" : [ "$index", "$$index" ] } },
                                                { "type" : 'like' },
                                                { "meta.state" : true },
                                            ]
                                        }
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "like_count"
                            }
                        }
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
        },
        LogFind : (data) => {
            return new Promise((resolve, reject) => {
                Schema.POST_LOG.find({ $or : [
                    { index : data.index, type : 'clients', 'meta.client' : data.client },
                    { index : data.index, type : 'users', 'meta.user' : data.user }
                ]}).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                })
            });
        },
        PostCount : (data) => {
            return new Promise((resolve, reject) => {
                try {
                    Schema.POST_LOG.aggregate([
                        { '$match' :  { 'index' : new ObjectId(data.index), type : 'count' } },
                        { '$group' : { '_id' : new ObjectId(data.index), 'count' : { '$sum' : 1 } } }
                    ], function(rr, ra){
                        if(ra){
                            resolve(ra)
                        }
                    });
                }catch(err){
                    reject(err);
                }
            }); 
        },
        PostLike : (data) => {
            return new Promise((resolve, reject) => {
                try {
                    Schema.POST_LOG.aggregate([
                        { '$match' :  { 'index' : new ObjectId(data.index), type : 'like', "meta.user" : new ObjectId(data.user) } },
                    ], function(rr, ra){
                        if(ra){
                            resolve(ra)
                        }
                    });
                }catch(err){
                    reject(err);
                }
            });
        }
    },
    Write : {
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
        Update : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.POST.insetImage(data).then((req) => {
                        resolve(req);
                    }).catch((err) => {
                        reject(err);
                    });
                } catch(err) {
                    reject(err);
                }
            })
        },
        PostLog : (data, count) => {
            return new Promise((resolve, reject) => {
                if(count == undefined){
                    let Array = [];
                    Array.push({
                        index : data.index,
                        type : 'clients',
                        meta : { client : data.client }
                    });
    
                    if(data.user != undefined){
                        Array.push({
                            index : data.index,
                            type : 'users',
                            meta : { user : data.user }
                        });
                    }
    
                    Array.push({ index : data.index, type : 'count' });
    
                    Schema.POST_LOG.insertMany(Array).then((req) => {
                        resolve(req);
                    }).catch((err) => {
                        reject(err);
                    });
                }else if(count == 'client' || count == 'user'){
                    let Object = {
                        index : data.index,
                        type : (count == 'client') ? 'clients' : 'users',
                        meta : (count == 'client') ? { client : data.client } : { user : data.user }
                    };
    
                    Schema.POST_LOG.create(Object).then((req) => {
                        resolve(req);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            });
        },
        PostLike : (data) => {
            const filter = { type: 'like', index: new ObjectId(data.index) , "meta.user": new ObjectId(data.user) };
            const update = {
                $set: { date: new Date(), "meta.state": data.state },
                $setOnInsert: { type: 'like', index: new ObjectId(data.index), "meta.user": new ObjectId(data.user) }
            };
            const options = { upsert : true, new : true };

            return new Promise((resolve, reject) => {
                Schema.POST_LOG.findOneAndUpdate(filter, update, options).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
    }
}

const COMMENT = {
    Read : {
        List : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.COMMENT.aggregate([
                        {
                            "$match" : { "_parent" : new ObjectId(data.index) }
                        },
                        {
                            "$sort" : { 'state.date_fix' : -1 }
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
                        }
                    ], function(rr, ra){
                        if(ra){
                            resolve(ra);
                        }
                    });
                } catch(err){
                    reject(err);
                }
            })
        },
        Count : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.COMMENT.aggregate([
                        { "$match" : { "_parent" : new ObjectId(data.index)} },
                        { '$group' : { '_id' : new ObjectId(data.index), 'count' : { '$sum' : 1 } } }
                    ], function(rr, ra){
                        if(ra){
                            resolve(ra);
                        }
                    });
                } catch(err){
                    reject(err);
                }
            })
        }
    },
    Write : {
        Create : (data) => {
            return new Promise((resolve, reject) => {
                Schema.COMMENT.create(data).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                })
            });
        },
    }
}

const IMAGE = {
    Read : {
        View : (data) => {
            return new Promise((resolve, reject) => {
                Schema.IMAGE.findOne({ _id : data.index }).then((req) => {
                    resolve(req);
                }).catch((error) => {
                    reject(error);
                })
            })
        }
    },
    Write : {
        InsertToo : (data) => {
            return new Promise((resolve, reject) => {
                Schema.IMAGE.insertMany(data).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                })
            });
        },
    },
}

module.exports = {
    POST, IMAGE, COMMENT
}