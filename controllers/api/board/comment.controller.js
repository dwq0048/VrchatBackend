const Schema = {
    COMMENT : require('../../../models/schema/post/comment')
};

const Comment = (req, res, next) => {
    const data = {
        inex: req.body.index,
        board: req.body.board,
        page: req.body.page,
        view: req.body.view
    }

    const success = (result) => {
        res.status(200).json({
            state : 'success',
            result
        });
    }

    const error = (err) => {
        res.status(200).json({
            state : 'fail',
            message: err.message
        });
    }

    Schema.COMMENT.page(data).then((req) => {
        success(req)
    }).catch((err) => {
        error(err)
    })


}

module.exports = Comment
