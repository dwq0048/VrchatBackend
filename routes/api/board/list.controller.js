const Post = require('../../../models/schema/post');

const list = (req, res, next) => {
    console.log(req.body);
    const data = {
        board: req.body.board,
        page: req.body.page,
        view: req.body.view
    }

    Post.page(data).then((req) => {
        res.status(200).json({
            state: 'success',
            data: req
        })
    }).catch((err) => {
        res.status(401).json({
            state: 'error',
            err
        })
    });

}

module.exports = list;
