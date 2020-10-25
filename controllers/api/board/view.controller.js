const Schema = require('../../../models/functions');

const view = (req, res, next) => {
    // Response Result
    const onResponse = (payload, count) => {
        res.status(200).json({
            state : 'success',
            payload,
            count : count
        });
    }

    const onError = (message) => {
        res.status(401).json({
            state : 'error',
            message : message
        });
    }
    // Response Result End

    
    const LocalPayload = res.locals.payload;
    const client = { host : req.ip || req.headers.host };

    let ViewRequest = {};
    let ViewCount = {};
    let data = { index: req.body.index, board: req.body.board, client : client.host };

    if(LocalPayload.status == 'success'){
        data.user = LocalPayload.info.index;
    }else {
        data.user = undefined;
    }

    const PostCount = async () => {
        let object = { clients : undefined, users : undefined };
        await Schema.POST.LogFind(data).then((req) => {
            if(typeof req == 'object'){
                if(req.length <= 0){ PostLog() }
                else{
                    req.map(item => {
                        if(item.type == 'clients'){ object.clients = item }
                        else if(item.type == 'users'){ object.users = item }
                    })
                    
                    if(typeof object.clients == undefined){ PostLog('client') }
                    if(typeof object.users == undefined){
                        if(data.user != undefined){ PostLog('user') }
                    }
                }
            }
        }).catch((error) => {
            throw new Error(error.message);
        });
    };

    const PostLog = async (count = undefined) => {
        await Schema.POST.PostLog(data, count).then((req) => {
            console.log(req);
        }).catch((error) => {
            throw new Error(error.message)
        });
    };

    const PostView = async () => {
        await Schema.POST.View(data).then((req) => {
            ViewRequest = { status : true, payload : req }
        }).catch((error) => {
            throw new Error(error.message);
        })

        return ViewRequest;
    }

    const Count = async () => {
        await Schema.POST.PostCount(data).then((req) => {
            ViewCount = (req.length > 0) ? req[0].count : 0;
        }).catch((error) => {
            throw new Error(error.message);
        });

        return ViewCount;
    }

    const RunCommand = async () => {
        try{
            await PostCount();
            const ResultCount = await Count();
            const ResultView = await PostView();

            onResponse(ResultView.payload[0], ResultCount );
        } catch (error){
            console.log(error);
            onError(error.message);
        }
    }
    RunCommand();

}

module.exports = view;
