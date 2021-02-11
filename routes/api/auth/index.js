const express = require('express');
const router = express.Router();

const Middleware = {
	TOKEN : require('../../../controllers/middleware/token.middleware'),
}

router.post('/login', require('../../../controllers/api/auth/login.controller'));
router.post('/logout', require('../../../controllers/api/auth/logout.controller'));
router.post('/join', require('../../../controllers/api/auth/join.controller'))
router.post('/token', Middleware.TOKEN, require('../../../controllers/api/auth/token.controller'));

router.post('/info', Middleware.TOKEN, require('../../../controllers/api/auth/info.controller'));

//router.post('/info', require('../../../controllers/api/auth/info.controller'));

module.exports = router;
