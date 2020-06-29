const Post = require('../../../models/schema/post');

const post = (req, res, next) => {
    console.log(req.body);

    res.status(200).json({
        haha : 'asdas'
    });
}

module.exports = post;