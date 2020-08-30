var express = require('express');
var router = express.Router();

router.get('/:id/:option?/:width?', require('../../controllers/files/image.controller'));

module.exports = router;
