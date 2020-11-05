const Schema = require('../../../../models/functions');

const post = (req, res, next) => {

    const payload = res.locals.payload;    
    if(payload.status == 'fail'){
        onError({ message: payload.message });

        return;
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
        user : {
            userid : payload.info.userid,
            userKey : payload.info.index,
            name : payload.info.name,
            nickname : payload.info.nickname
        },
        type : {
            state : 2,
            password : '',
            skin : ''
        },
        post : data.comment
    }

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

    const UploadComment = async () => {
        let payload = {};

        await Schema.COMMENT.Write.Create(object).then((req) => {
            payload = req;
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
