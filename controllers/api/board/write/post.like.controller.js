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
        user : user.index,
        state : (req.body.state) ? true : false
    }

    const FindLikeLog = async () => {
        let result = {};
        await Schema.POST.Write.PostLike(data).then((req) => {
            result = req;
        }).catch((err) => {
            throw new Error(err);
        });

        return result;
    }

    const RunCommand = async () => {
        try {
            const result = await FindLikeLog();
            response(result);
        }catch(err){
            onError(err);
        }
    }
    RunCommand();

}

module.exports = post
