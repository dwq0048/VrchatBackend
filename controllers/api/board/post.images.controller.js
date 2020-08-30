const Schema = {
    POST :require('../../../models/schema/post/post')
};

const Post = (req, res, next) => {
    console.log(req.body);

    res.status(200).json({
        haha : 'asdas'
    });
}

module.exports = Post;