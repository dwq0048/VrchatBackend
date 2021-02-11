const Schema = {
    USER : require('../../../models/schema/user/user')
}

const Info = (req, res, next) => {
    const onResponse = (payload) => {
        res.status(200).json({ state : 'success', payload });
    }

    const onError = (err) => {
        res.status(200).json({ state : 'fail', message: err.message });
    }

    const LocalPayload = res.locals.payload;

    const user  = {
        index : LocalPayload.info.index,
        userid : LocalPayload.info.userid,
        access : LocalPayload.info.access
    };

    console.log(user);
    console.log(req.body);

    const RunCommand = async () => {
        try {
            onResponse();
        }catch(err){
            onError(err);
        }
    }
    RunCommand();

}

module.exports = Info;
