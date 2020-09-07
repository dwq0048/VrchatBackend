const Schema = require('../../models/functions');
const multer = require('multer');
const fs = require('fs');

const HELPER = {
    formatDate : Schema.HELP.formatDate,
}

const config = require('../../config/index.js');
const options = config.image;

const mkdir = ( dirPath ) => {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}

const Storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const Today = HELPER.formatDate(Date.now());

        await mkdir( options.path.imgPath +'/'+ Today +'/'+ 'original' );
        await mkdir( options.path.imgPath +'/'+ Today +'/'+ 'fixed' );
        await mkdir( options.path.imgPath +'/'+ Today );
        await mkdir( options.path.imgPath );

        cb(null, options.path.imgPath +'/'+ Today +'/'+ 'original');
    }
});

const upload = multer({
    storage : Storage
});

module.exports = upload.array('images')
