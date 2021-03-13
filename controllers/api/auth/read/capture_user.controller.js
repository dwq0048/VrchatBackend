const Schema = require('../../../../models/functions');

const user = (req, res, next) => {
    const onResponse = (payload) => {
        res.status(200).json({ state : 'success', payload });
    }

    const onError = (err) => {
        res.status(200).json({ state : 'fail', message: err.message });
    }

    let data = {
        index : (typeof req.body.index == 'string') ? req.body.index : undefined,
        request : (typeof req.body.request == 'array' || typeof req.body.request == 'object') ? req.body.request : []
    }

    const RunCommand = async () => {
        await Schema.USER.Read.Profile(data).then((req) => {
            let filter = { nickname : (typeof req.nickname == 'string' ) ? req.nickname : undefined };
            
            data.request.forEach((item, index) => {
                switch(item){
                    case 'description':
                        if(typeof req.meta == 'object'){
                            filter.description = (typeof req.meta.description == 'string') ? req.meta.description : undefined
                        }
                        break;
                    case 'thumbnail':
                        if(typeof req.meta == 'object'){
                            filter.thumbnail = (typeof req.meta.thumbnail == 'string' || typeof req.meta.thumbnail == 'object') ? req.meta.thumbnail : undefined
                        }
                        break;
                }
            });
        }).catch((err) => {
            console.log(err);
        });
        onResponse({ message : 'hi' });
    };

    RunCommand();
};

module.exports = user;
