const Schema = require('../../../models/functions');

const view = (req, res, next) => {
    // Response Result
    const onResponse = (payload) => {
        res.status(200).json({
            state : 'success',
            payload
        });
    }

    const onError = (message) => {
        res.status(401).json({
            state : 'error',
            message : message
        });
    }
    // Response Result End

    const data = {
        index: req.body.index,
        board: req.body.board
    }

    let ViewRequest = {};

    const ViewPost = async () => {
        await Schema.POST.View(data).then((req) => {
            ViewRequest = { status : true, payload : req }
        }).catch((error) => {
            throw new Error(error.message);
        })

        return ViewRequest;
    }

    const RunCommand = async () => {
        try{
            const ResultView = await ViewPost();
            onResponse(ResultView.payload[0]);
        } catch (error){
            console.log(error);
            onError(error.message);
        }
    }
    RunCommand();

}

module.exports = view;
