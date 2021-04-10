const token = (req, res, next) => {
    const onError = (err) => {
        res.status(200).json({ status: 'fail', message: err.message });
    }

    const onResponse = (payload) => {
        res.status(200).json({ status: 'success', payload });
    }

    const LocalToken = res.locals.token;

    const RunCommand = async () => {
        return new Promise((resolve, reject) => {
            if(LocalToken || typeof LocalToken == 'object'){
                if(typeof LocalToken.status == 'string'){
                    (LocalToken.status == 'success') ? resolve({ data : 'haha' }) : reject({ message : LocalToken.error });
                }else{
                    throw new Error('Token is empty');
                }
            }else{
                throw new Error('Token is empty');
            }
        });
    }

    RunCommand().then(onResponse).catch(onError);
}

module.exports = token;
