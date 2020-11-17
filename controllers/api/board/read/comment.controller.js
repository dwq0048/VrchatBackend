const Schema = require('../../../../models/functions');

const Comment = (req, res, next) => {
    const data = {
        index: (typeof req.body.index == 'string') ? req.body.index : false,
        board: req.body.board,
        limit: (typeof req.body.limit == 'number') ? req.body.limit : 50,
        last: (typeof req.body.last == 'object') ? req.body.last : false
    }

    const onResponse = (payload) => {
        res.status(200).json({ state : 'success', payload });
    }

    const onError = (err) => {
        res.status(200).json({ state : 'fail', message: err.message });
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
            ResultComment.map((item) => {
                item.users = item.users[0];
            });
            onResponse(ResultComment);
        }catch(err){
            onError(err);
        }
    }
    RunCommand();


}

module.exports = Comment
