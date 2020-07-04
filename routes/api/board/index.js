var express = require('express');
var router = express.Router();

var multer = require('multer');
var upload = multer({
  dest: './public/uploads/images/'
});

router.post('/post', upload.array('images'),  require('./post.controller'));
router.post('/list/:id', require('./list.controller'));
router.post('/view/:id', require('./view.controller'));

//router.post('/post/:id', require('./post.images.controller'));
//router.get('/list', require('./list.controller.js'));

module.exports = router;
