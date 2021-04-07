const Schema = {
    USER : require('../../../models/schema/user/user')
}

const Join = (req, res, next) => {

    const payload = {
        userid : req.body.USER_ID,
        password : req.body.USER_PW,
        username : req.body.USER_NAME,
        nickname : req.body.NICK_NAME,
        email : req.body.E_MAIL
    }

    Schema.USER.create(payload).then((req) => {
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
