const Schema = require('../../../../models/functions');

const List = (req, res, next) => {
    const data = {
        board: req.body.board,
        page: req.body.page,
        view: req.body.view
    }

    let ListRequest = {};
    let CommentCount = {};

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

    const Page = () => {
        Schema.POST.Read.Page(data).then((req) => {
            onResponse(req);
        }).catch((err) => {
            onError(err)
        })

        return ListRequest;
    }

    const RunCommand = async () => {
        Page();
    }

    try{
        RunCommand();
    }catch(err){
        console.log(err);
    }

}

module.exports = List;
