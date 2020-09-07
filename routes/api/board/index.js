const express = require('express');
const router = express.Router();

const Middleware = {
	TOKEN : require('../../../controllers/middleware/token.middleware'),
	IMAGES : require('../../../controllers/middleware/images.middleware'),
}


router.post('/post', Middleware.TOKEN, Middleware.IMAGES, require('../../../controllers/api/board/post.controller'));

router.post('/list/:id', require('../../../controllers/api/board/list.controller'));
router.post('/view/:id', require('../../../controllers/api/board/view.controller'));

router.post('/comment', require('../../../controllers/api/board/comment.controller'));
router.post('/comment/reply', Middleware.TOKEN, require('../../../controllers/api/board/reply.controller'));

module.exports = router;
