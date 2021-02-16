const Profile = (req, res, next) => {
    const onResponse = (payload) => {
        res.status(200).json({ state : 'success', payload });
    }

    const onError = (err) => {
        res.status(200).json({ state : 'fail', message: err.message });
    }

    const RunCommand = async () => {
        try {
            onResponse();
        }catch(err){
            onError(err);
        }
    }
    RunCommand();
}

module.exports = Profile;
