const Schema = require('../../../../models/functions');

const Comment = (req, res, next) => {
    const data = {
        index: req.body.index,
        board: req.body.board,
        list: (typeof req.body.list == 'number') ? req.body.list : 0,
        view: (typeof req.body.view == 'number') ? req.body.view : 50,
    }

    console.log(req.body.list);
    console.log(data);

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
