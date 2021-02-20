const Profile = (req, res, next) => {
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

    /*
    let data = {
        board : req.body.board,
        title : req.body.title,
        content : req.body.content,
        meta : req.body.meta
    };
    */

    console.log(req.body);

    const RunCommand = async () => {
        try {
            onResponse(req.body);
        }catch(err){
            onError(err);
        }
    }
    RunCommand();
}

module.exports = Profile;
