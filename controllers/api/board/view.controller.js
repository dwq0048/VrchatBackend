const Schema = require('../../../models/functions');

const view = (req, res, next) => {
    const data = {
        index: req.body.id,
        board: req.body.board
    }

    Schema.POST.View(data).then((req) => {
        res.status(200).json({
            state: 'success',
            payload : req[0]
        })    
    }).catch((e) => {
        res.status(401).json({
            state: 'error',
            e
        })
    })
}

module.exports = view;
