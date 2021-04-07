const Helper = require('../../models/helper/index');
const config = require('../../config/index.js');

const upload = (req, res, next) => {
    console.log(config.UPLOAD);
    console.debug('asdkjasdljaskdjl');
    for(item in config.UPLOAD.option){
        console.log(item);
    }
    
    next();
}

module.exports = upload;
