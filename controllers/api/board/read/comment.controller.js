const Schema = require('../../../../models/functions');

const Comment = (req, res, next) => {
    const data = {
        index: req.body.index,
        board: req.body.board,
        page: req.body.page,
        view: req.body.view
    }

    const onResponse = (payload) => {
        res.status(200).json({
            state : 'success',
            payload
        });
    }

    const onError = (err) => {
        res.status(200).json({
            state : 'fail',
            message: err.message
        });
    }

    const UpdatePost = async () => {
        let ResultComment = {};
        await Schema.COMMENT.Read.List(data).then((req) => {
            ResultComment = req;
        }).catch((err) => {
            throw new Error(err);
        })

        return ResultComment;
    }

    const RunCommand = async () => {
        try {
            let ResultComment = await UpdatePost();
            onResponse(ResultComment);
        }catch(err){
            onError(err);
        }
    }
    RunCommand();


}

module.exports = Comment
