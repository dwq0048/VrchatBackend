const Schema = require('../../models/functions');

const views = (req, res, next) => {
    const LocalPayload = res.locals.payload;
    const data = {
        index : req.body.index,
        user : LocalPayload.info.index,
        host : req.ip || req.headers.host,
    };

    const onError = (error) => {
        const payload = { status: 'fail', message: error.message };
        res.locals.views = payload;
        console.log(error);

        next();
    }


    const PostCount = async () => {
        Schema.POST.Write.PostCount(data).then((req) => {
            //console.log(req);
        }).catch((error) => {
            throw new Error(error);
        });
    };

    const RunCommand = async () => {
        try{
            await PostCount();
            next();
        } catch (error){ onError(error) }
    }
    RunCommand();
}

module.exports = views;
