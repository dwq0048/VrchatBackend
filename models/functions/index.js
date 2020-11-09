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
        Find : () => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.POST.aggregate([
                        {
                            "$lookup" : {
                                "from" : Schema.USER.collection.name,
                                "localField" : "user",
                                "foreignField" : "_id",
                                "as" : "users"
                            }
                        },
                    ], function(rr, ra){
                        if(ra){ resolve(ra) }else{ resolve({ message : 'idk' }) }
                    });
                }catch(err){
                    resolve(err);
                }
            });
        },
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
                                                { "type" : 'views' },
                                            ]
                                        }
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "views_count"
                            }
                        },
                    ], function(rr,ra){
                        if(ra){ resolve(ra) }else{ reject({ message : 'idk' }) }
                    });
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
                                                { "type" : 'views' },
                                            ]
                                        }
                                    },
                                    { "$group" : { _id: null, count: { $sum: 1 } } }
                                ],
                                "as" : "views_count"
                            }
                        },
                    ] , function(rr,ra){
                        if(ra){ resolve(ra) }else{ reject({ message : 'idk' }) }
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
        PostLike : (data) => {
            return new Promise((resolve, reject) => {
                try {
                    Schema.POST_LOG.aggregate([
                        { '$match' :  { 'index' : new ObjectId(data.index), type : 'like', "meta.user" : new ObjectId(data.user) } },
                    ], function(rr, ra){
                        if(ra){ resolve(ra) }else{ reject({ message : 'idk' }) }
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
        PostCount : (data) => {
            let meta = { };
            (data.user) ? meta["meta.user"] = { $each : [data.user] } : undefined;
            (data.host) ? meta["meta.host"] = { $each : [data.host] } : undefined;

            const filter = {
                $or : [
                    { $and : [
                        { type: 'views' },
                        { index: new ObjectId(data.index) },
                        { "meta.user": [ data.user ] }
                    ] },
                    { $and : [
                        { type: 'views' },
                        { index: new ObjectId(data.index) },
                        { "meta.host": [ data.host ] },
                    ] }
                ],
            };
            const update = { $setOnInsert: {
                type: 'views', date: new Date(), index: new ObjectId(data.index), "meta.user": new Array(), "meta.host": new Array()
            }};
            const options = { upsert : true, new : true };

            return new Promise((resolve, reject) => {
                Schema.POST_LOG.findOneAndUpdate(filter, update, options).then((req) => {
                    const FindFilter = { _id : new ObjectId(req._id) };
                    const FindUpdate = { $addToSet : meta, $setOnInsert: { date: new Date() } };
                    const FindOptions = { upsert : true, new : true };

                    Schema.POST_LOG.findOneAndUpdate(FindFilter, FindUpdate, FindOptions).then((req) => {
                        resolve(req);
                    }).catch((err) => {
                        reject(err);
                    })
                }).catch((err) => {
                    reject(err);
                })
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
        Find : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.COMMENT.aggregate([
                        {
                            "$match" : { "_id" : new ObjectId(data) }
                        },
                        {
                            "$limit" : 1
                        },
                        {
                            "$lookup" : {
                                "from" : Schema.USER.collection.name,
                                "localField" : "user",
                                "foreignField" : "_id",
                                "as" : "users"
                            }
                        },
                    ], function(rr, ra){
                        if(ra){
                            resolve(ra);   
                        }else{
                            reject({ message : 'idk' });
                        }
                    });
                }catch(err){
                    reject(err);
                }
            });
        },
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
                        },
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