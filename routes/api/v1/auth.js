const express = require('express');
const router = express.Router();

const Middleware = {
	TOKEN : require('../../../controllers/middleware/token.middleware'),
	FORMS : require('../../../controllers/middleware/forms.middleware'),
}

router.post('/login', Middleware.FORMS(false), require('../../../controllers/api/auth/login.controller'));
router.post('/token', Middleware.TOKEN, require('../../../controllers/api/auth/token.controller'));
router.post('/logout', require('../../../controllers/api/auth/logout.controller'));

module.exports = router;
