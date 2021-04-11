const mongoose = require('mongoose');
const Schema = {
    POST : require('../schema/post/post'),
    POST_META : require('../schema/post/post.meta'),
    COMMENT : require('../schema/post/comment'),
    USER : require('../schema/user/user'),
    USER_META : require('../schema/user/user.meta'),
    IMAGE : require('../schema/file/image'),
    SESSION : require('../schema/user/session')
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
        Count : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.POST.aggregate([
                        {
                            "$match" : { "board" : data.board }
                        },
                        {
                            "$group": { _id: null, count: { $sum: 1 } }
                        },
                        {
                            "$project": { _id: 0 }
                        }
                    ],function(rr,ra){
                        if(ra){ resolve(ra) }else{ reject({ message : 'idk' }) }
                    });
                }catch(err){
                    reject(err);
                }
            });
        },
        Page : (data) => {
            let object = [
                {
                    "$sort" : { 'state.date_fix' : -1 }
                },
                {
                    "$skip" : (Number(data.page) * Number(data.view))
                },
                {
                    "$limit" : Number(data.view)
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
                        "from" : Schema.POST_META.collection.name,
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
                        "from" : Schema.POST_META.collection.name,
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
                        "from" : Schema.POST_META.collection.name,
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
            ];

            if(typeof data.board == 'string'){
                object.unshift({ "$match" : { "board" : data.board } });
            }else{
                if(data.user != undefined){
                    object.unshift({ "$match" : { "user" : new ObjectId(data.user) } });
                }
            }

            return new Promise((resolve, reject) => {
                try{
                    Schema.POST.aggregate(object, function(rr,ra){
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
                                "from" : Schema.POST_META.collection.name,
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
                                "from" : Schema.POST_META.collection.name,
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
                                "from" : Schema.POST_META.collection.name,
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
                Schema.POST_META.find({ $or : [
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
                    Schema.POST_META.aggregate([
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
                Schema.POST_META.findOneAndUpdate(filter, update, options).then((req) => {
                    const FindFilter = { _id : new ObjectId(req._id) };
                    const FindUpdate = { $addToSet : meta, $setOnInsert: { date: new Date() } };
                    const FindOptions = { upsert : true, new : true };

                    Schema.POST_META.findOneAndUpdate(FindFilter, FindUpdate, FindOptions).then((req) => {
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
                Schema.POST_META.findOneAndUpdate(filter, update, options).then((req) => {
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
           let MatchObject = {
                "$match" : {
                    "$and" : [
                        { "_parent" : (typeof data.index == 'string') ? new ObjectId(data.index) : 0 }
                    ]
                }
            }

            if(data.last){
                if(typeof data.last.index == 'string' && typeof data.last.date == 'string'){
                    MatchObject.$match.$and.push({ "state.date" : { "$lt" : new Date(data.last.date) } });
                }
            }
    
            return new Promise((resolve, reject) => {
                try{
                    Schema.COMMENT.aggregate([
                        MatchObject,
                        {
                            "$sort" : { 'state.date' : -1 }
                        },
                        {
                            "$limit" : data.limit
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
                            if(data.last){
                                console.log(ra);
                            }
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

const USER = {
    Write : {
        Update : (data) => {
            const filter = {
                $or : [
                    { $and : [ { _id: new ObjectId(data.index) }, ] },
                ],
            };
            //let update = { $setOnInsert: { meta : {} } };
            let update = { $set: { meta : {} } };
            if(typeof update.$set == 'object'){
                if(typeof data.meta == 'object'){
                    // 썸네일
                    if(typeof data.meta.thumbnail == 'object' || typeof data.meta.thumbnail == 'string'){
                        update.$set.meta.thumbnail = new ObjectId(data.meta.thumbnail);
                    }
                    
                    // 닉네임
                    if(typeof data.nickname == 'string'){
                        update.$set.nickname = data.nickname;
                    }

                    // 설명글
                    if(typeof data.meta.description == 'string'){
                        update.$set.meta.description = data.meta.description;
                    }
                }
            }
            const options = { upsert : false, new : true };

            return new Promise((resolve, reject) => {
                Schema.USER.findOneAndUpdate(filter, update, options).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                })
            });
        }
    },
    Read : {
        FindByID : (data) => {
            return new Promise((resolve, reject) => {
                try {                
                    Schema.USER.findOne(data).then((req) => {
                        if(typeof req == 'object'){
                            resolve(req);
                        }else{
                            reject({ message : 'fail' });
                        }
                    }).catch((err) => {
                        reject(err);
                    })
                }catch(err){
                    throw new Error(err.message);
                }
            });
        },
        Profile : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.USER.aggregate([
                        {
                            "$match" : { "_id" : new ObjectId(data.index) }
                        },
                        {
                            "$limit" : 1
                        },
                    ],function(rr, ra){
                        if(ra){
                            if(ra.length > 0){
                                resolve(ra[0]);
                            }else{
                                reject({message : false})
                            }
                        }
                    });
                }catch(e){
                    reject(e);
                }
            })
        }
    }
}

const USER_META = {
    Write : {
        InsertMany : (data) => {
            return new Promise((resolve, reject) => {
                insertMany(data).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                })
            });
        }
    }
}

const SESSION = {
    Read : {
        Verification : (data) => {
            return new Promise((resolve, reject) => {
                let array = [
                    {
                        "$lookup" : {
                            "from" : Schema.USER.collection.name,
                            "localField" : "index",
                            "foreignField" : "_id",
                            "as" : "users"
                        }
                    }
                ];
                if(!data.type){
                    array.push({ "$match" : { "access" : data.access } });
                }else{
                    array.push({ "$match" : { "access" : data.access, "refresh" : data.refresh } });
                }

                Schema.SESSION.aggregate(array, function(rr,ra){
                    if(ra){
                        if(typeof ra == 'object' || typeof ra == 'array'){
                            if(ra.length > 0){
                                if(typeof ra[0].users == 'object' || typeof ra[0].users == 'array'){
                                    if(ra[0].users.length > 0){
                                        ra = ra[0];
                                        ra.users = ra.users[0];
                                        resolve(ra);
                                    }else{
                                        reject({ message : 'No data' });
                                    }
                                }
                            }else{
                                reject({ message : 'No data' });
                            }
                        }else{
                            reject({ message : 'No data' });
                        }
                    }else{
                        reject({ message : 'No data' });
                    }
                })
            });
        },
    },
    Write : {
        Create : (data) => {
            return new Promise((resolve, reject) => {
                Schema.SESSION.create(data).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                });
            })
        }
    },
    /*
    Delete : {
        expiration : (data) => {
            return new Promise((resolve, reject) => {
                Schema.SESSION.aggregate([
                    {
                        "$match" : {
                            "$and" : [
                                { "index" : data.index },
                                { "issued" : { "$lt" :  } }
                            ]
                        }
                    }
                ]).forEach(function(doc) {
                    db.getCollection("Collection").remove({ "_id": doc._id });
                });
            })
        }
    }
    */
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
    POST, IMAGE, COMMENT, USER, USER_META, SESSION,
}