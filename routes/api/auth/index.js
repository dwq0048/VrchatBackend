var express = require('express');
var router = express.Router();

router.post('/login', require('./login.controller'));
router.post('/token', require('./token.controller'));

module.exports = router;
