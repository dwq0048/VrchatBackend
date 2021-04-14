const logout = (req, res, next) => {
    const onResponse = () => {
        try {
            res.cookie('_SESSION', '', { httpOnly: true }).status(200).json({ status: 'success' });
        }catch(err){
            onError(err);
        }
    }

    const onError = (err) => {
        res.status(200).json({ status: 'fail', message: err.message });
    }

    onResponse();
}

module.exports = logout;
