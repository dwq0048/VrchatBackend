const Schema = require('../../../models/functions');

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
            message: err.message
        });
    }

    Schema.COMMENT.Create(object).then((req) => {
        response(req);
    }).catch((err) => {
        onError(err.message)
    })


}

module.exports = post
