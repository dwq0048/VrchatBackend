const express = require('express');
const router = express.Router();

const Middleware = {
	TOKEN : require('../../../controllers/middleware/token.middleware'),
	IMAGES : require('../../../controllers/middleware/images.middleware'),
}

// Read
router.post('/read/list/:id', require('../../../controllers/api/board/read/list.controller'));
router.post('/read/post/like', Middleware.TOKEN, require('../../../controllers/api/board/read/post.like.controller'));
router.post('/read/view/:id', Middleware.TOKEN, require('../../../controllers/api/board/read/view.controller'));
router.post('/read/comment', require('../../../controllers/api/board/read/comment.controller'));

// Write
router.post('/write/post', Middleware.TOKEN, Middleware.IMAGES, require('../../../controllers/api/board/write/post.controller'));
//router.post('/write/post/log/', Middleware.TOKEN, require('../../../controllers/api/board/write/post.log.controller'));
router.post('/write/post/like', Middleware.TOKEN, require('../../../controllers/api/board/write/post.like.controller'))
router.post('/write/comment', Middleware.TOKEN, require('../../../controllers/api/board/write/comment.controller'));

module.exports = router;
