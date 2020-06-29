var express = require('express');
var router = express.Router();

router.get('/board/notice/:id', require('./images.controller'));

module.exports = router;
