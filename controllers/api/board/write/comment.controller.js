const Schema = require('../../../../models/functions');

const post = (req, res, next) => {
    // Response Result
    const response = (result) => {
        res.status(200).json({
            state : 'success',
            result
        });
    }

    const onError = (err) => {
        res.status(200).json({
            state : 'fail',
            message: err
        });
    }
    // Response Result End

    const LocalPayload = res.locals.payload;

    const user  = {
        index : LocalPayload.info.index,
        userid : LocalPayload.info.userid,
        access : LocalPayload.info.access
    }

    const data = {
        index: req.body.index,
        board: req.body.board,
        comment: req.body.comment
    }

    const object = {
        _parent : data.index,
        title : '',
        board : data.board,
        user : user.index,
        type : {
            state : 2,
            password : '',
            skin : ''
        },
        post : data.comment
    }

    const UploadComment = async () => {
        let payload = {};

        await Schema.COMMENT.Write.Create(object).then((req) => {
            payload = req._id;
        }).catch((err) => {
            throw new Error(err.message)
        })

        return payload;
    }

    const RunCommand = async () => {
        try {
            let result = await UploadComment();
            response(result);
        }catch (err) {
            onError(err);
        }

    }
    RunCommand();

}

module.exports = post
