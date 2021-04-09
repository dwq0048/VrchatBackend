const token = (req, res, next) => {
    const onError = (err) => {
        res.status(200).json({ status: 'fail', message: err.message });
    }

    const onResponse = (payload) => {
        res.status(200).json({ status: 'success', payload });
    }

    const LocalToken = res.locals.token;

    const RunCommand = () => {
        if(LocalToken || typeof LocalToken == 'object'){
            if(typeof LocalToken.status == 'string'){
                if(LocalToken.status == 'success'){
                    onResponse({ data : 'haha' });
                }else{
                    onError({ message : 'Token authentication failed' });
                }
            }else{
                onError({ message : 'Token is empty' });
            }
        }else{
            onError({ message : 'Token is empty' });
        }
    }
    RunCommand();
}

module.exports = token;
