const Schema = require('../../models/functions');
const Helper = require('../../models/helper/index');
const multer = require('multer');
const fs = require('fs');

const config = require('../../config/index.js');
const options = config.image;

const mkdir = ( dirPath ) => {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) { fs.mkdirSync( dirPath, { recursive: true } ) };
}

const images = async (req, res, next, location) => {
    const Today = Helper.NORMAL.formatDate(Date.now());

    console.log(Today);
    
    // Post
    await mkdir( options.path.upload + '/images' +'/'+ Today +'/'+ 'original' );
    await mkdir( options.path.upload + '/images' +'/'+ Today +'/'+ 'fixed' );
    await mkdir( options.path.upload + '/images' +'/'+ Today );
    await mkdir( options.path.upload + '/images' );

    // Profile
    await mkdir( options.path.upload + '/profile' +'/'+ Today +'/'+ 'original' );
    await mkdir( options.path.upload + '/profile' +'/'+ Today +'/'+ 'fixed' );
    await mkdir( options.path.upload + '/profile' +'/'+ Today );
    await mkdir( options.path.upload + '/profile' );

    return upload[location.path].array(location.array);
}

const upload = {
    post : multer({
        storage : multer.diskStorage({
            destination: async function (req, file, cb) {
                cb(null, options.path.upload + '/images' +'/'+ Today +'/'+ 'original');
            }
        })
    }),
    profile : multer({
        storage : multer.diskStorage({
            destination: async function (req, file, cb) {   
                cb(null, options.path.upload + '/profile' +'/'+ Today +'/'+ 'original');
            }
        })
    })
}

module.exports = {
    POST : images({ path : 'post', array : 'images' }),
    PROFILE : images({ path : 'profile', array : 'image' }),
}
