const Post = require('../../../models/schema/post');

const view = (req, res, next) => {
    const data = {
        id: req.body.id,
        board: req.body.board
    }

    Post.findOne({ _id: data.id }).then((req) => {
        res.status(200).json({
            state: 'success',
            req
        })    
    }).catch((e) => {
        res.status(401).json({
            state: 'error',
            e
        })
    })
}

module.exports = view;
