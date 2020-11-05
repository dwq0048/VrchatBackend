const post = (req, res, next) => {

    const response = (result) => {
        res.status(200).json({
            state : 'success',
            result
        });
    }

    const onError = (err) => {
        res.status(200).json({
            state : 'fail',
            message: err.message
        });
    }

    const RunCommand = () => {
        const object = {
            userAgent : req.headers["user-agent"] || req.get('User-Agent'),
        }

        response({obejct : object});
    }
    RunCommand();

}

module.exports = post
