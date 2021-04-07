const Schema = {
    USER : require('../../../models/schema/user/user'),
    SESSION :  require('../../../models/schema/user/session')
}

const logout = (req, res, next) => {
    // 정상적일 경우 등록
    const respond = (token) => {
        res.cookie('_SESSION', '', { httpOnly: true })
        .status(200).json({
            status: 'success'
        });
    }

    // 에러
    const onError = (err) => {
        console.log(err);
        res.status(200).json({
            status: 'fail',
            message: err.message
        });
    }

    respond();
}

module.exports = logout;
