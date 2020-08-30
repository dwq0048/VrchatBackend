const express = require('express');
const multer = require('multer');
const fs = require('fs');
const TOKEN_MID = require('../../../controllers/middleware/token.middleware');

const config = require('../../../config/index.js');
const options = config.image;

const router = express.Router();
const Storage = multer.diskStorage({
	destination: async function (req, file, cb) {
		const Today = formatDate(Date.now());

		await mkdir( options.path.imgPath +'/'+ Today +'/'+ 'original' );
		await mkdir( options.path.imgPath +'/'+ Today +'/'+ 'fixed' );
		await mkdir( options.path.imgPath +'/'+ Today );
		await mkdir( options.path.imgPath );

		cb(null, options.path.imgPath +'/'+ Today +'/'+ 'original');
	}
});

const formatDate = (date) => {
	let d = new Date(date);
	let month = '' + (d.getMonth() + 1);
	let day = '' + d.getDate();
	let year = d.getFullYear();

	if (month.length < 2){ month = '0' + month };
	if (day.length < 2){ day = '0' + day };

	return [year, month].join('');
}

const mkdir = ( dirPath ) => {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}

const upload = multer({
  storage : Storage
});

router.post('/post', TOKEN_MID ,upload.array('images'), require('../../../controllers/api/board/post.controller'));
router.post('/list/:id', require('../../../controllers/api/board/list.controller'));
router.post('/view/:id', require('../../../controllers/api/board/view.controller'));

router.post('/comment', require('../../../controllers/api/board/comment.controller'));
router.post('/comment/reply', TOKEN_MID, require('../../../controllers/api/board/reply.controller'));

//router.post('/post/:id', require('./post.images.controller'));
//router.get('/list', require('./list.controller.js'));

module.exports = router;
