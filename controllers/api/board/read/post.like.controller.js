const Schema = require('../../../../models/functions');

const post = (req, res, next) => {

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

    const LocalPayload = res.locals.payload;

    const user  = {
        index : LocalPayload.info.index,
        userid : LocalPayload.info.userid,
        access : LocalPayload.info.access
    }

    const data = {
        index : req.body.index,
        user : user.index
    }

    const FindLike = async () => {
        Schema.POST.Read.PostLike(data).then((req) => {
            console.log(req);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    const RunCommand = async () => {
        try {
            await FindLike();

            response({});
        }catch(err){
            onError(err);
        }
    }
    RunCommand();

}

module.exports = post
