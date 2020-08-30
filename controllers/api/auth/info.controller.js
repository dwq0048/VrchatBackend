const Schema = {
    USER : require('../../../models/schema/user/user')
}

const Join = (req, res, next) => {
    const payload = req.body;
    
    Schema.USER.findOneByIndex(payload).then((req) => {
        console.log(req);

        res.status(200).json({
            status: 'success',
            payload
        });
    }).catch((err) => {
        res.status(401).json({
            status: 'fail',
            message: err.message
        });
    });

}

module.exports = Join;
