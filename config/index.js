let config = {
    db : {
        type : 'mongodb',
        address : '127.0.0.1',
        port : '27017',
        collection : 'backend',
    },
    jwt : {
        secret : 'luochi',
        ReSecret : 'reluochi'
    },
    upload : {
        path : './public/uploads',
        option : {
            post : {
                upload : 'post',
                resize : {
                    size : [ 480, 960, 1200 ]
                },
                version : 'v0'
            },
            profile : {
                uplaod : 'profile',
                resize : {
                    size : [ 480, 960, 1200 ]
                },
                version : 'v0'
            }
        }
    },
};

module.exports = {
    DB : config.db,
    JWT : config.jwt,
    UPLOAD : config.upload
};
