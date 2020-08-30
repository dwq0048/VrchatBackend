const config = {
    db : {
        address : 'mongodb://127.0.0.1:27017/backend'
    },
    jwt : {
        secret : 'luochi',
        ReSecret : 'reluochi'
    },
    image : {
        path : {
            upload : './public/uploads',
            images : '/images',
            imgPath : ''
        },
        option : [
            {
                name : 'resize',
                meta : {
                    width: 850
                }
            },
            {
                name : 'resize',
                meta : {
                    width: 370
                }
            },
            {
                name : 'thumbnail',
                meta : {
                    width: 150,
                    height: 150
                }
            }
        ],
        version : 'v0'
    }
};

config.image.path.imgPath = config.image.path.upload + config.image.path.images;

module.exports = {
    DB : config.db,
    JWT : config.jwt,
    image : config.image
};
