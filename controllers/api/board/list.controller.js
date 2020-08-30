const Schema = require('../../../models/functions');

const List = (req, res, next) => {
    const data = {
        board: req.body.board,
        page: req.body.page,
        view: req.body.view
    }

    const onError = (message) => {
        res.status(401).json({
            state: 'error',
            message: message
        })
    }

    const onResponse = (payload) => {
        res.status(200).json({
            state: 'success',
            payload
        })
    }

    const page = () => {
        Schema.POST.Page(data).then((req) => {
            onResponse(req);
        }).catch((err) => {
            onError(err)
        })
    }

    const RunCommand = () => {
        page();
    }

    try{
        RunCommand();
    }catch(err){
        console.log(err);
    }

}

module.exports = List;
