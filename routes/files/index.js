var express = require('express');
var router = express.Router();

router.get('/:id', require('../../controllers/files/image.controller'));

module.exports = router;
