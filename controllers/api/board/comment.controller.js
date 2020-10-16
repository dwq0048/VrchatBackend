const Schema = require('../../../models/functions');

const Comment = (req, res, next) => {
    const data = {
        index: req.body.index,
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

    const UpdatePost = () => {
        Schema.COMMENT.List(data).then((req) => {
            success(req)
        }).catch((err) => {
            error(err)
        })
    }

    const RunCommand = () => {
        UpdatePost()
    }
    RunCommand();


}

module.exports = Comment
