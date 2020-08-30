const express = require('express');
const router = express.Router();
const TOKEN_MID = require('../../../controllers/middleware/token.middleware');

router.post('/login', require('../../../controllers/api/auth/login.controller'));
router.post('/logout', require('../../../controllers/api/auth/logout.controller'));
router.post('/join', require('../../../controllers/api/auth/join.controller'))
router.post('/token', TOKEN_MID, require('../../../controllers/api/auth/token.controller'));

//router.post('/info', require('../../../controllers/api/auth/info.controller'));

module.exports = router;
