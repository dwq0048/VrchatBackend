const Profile = (req, res, next) => {
    const onResponse = (payload) => {
        res.status(200).json({ state : 'success', payload });
    }

    const onError = (err) => {
        res.status(200).json({ state : 'fail', message: err.message });
    }

    const LocalPayload = res.locals.payload;
    const user  = {
        auth : (LocalPayload.status == 'success') ? true : false,
        index : LocalPayload.info.index,
        userid : LocalPayload.info.userid,
        access : LocalPayload.info.access
    };
    let data = {
        nickname : (!req.body.nickname || req.body.nickname == '' || req.body.nickname == undefined ) ? undefined : req.body.nickname,
        description : (!req.body.nickname || req.body.nickname == '' || req.body.nickname == undefined ) ? undefined : req.body.description,
        meta : (req.body.meta == undefined) ? '{}' : req.body.meta
    }

    try{ data.meta = JSON.parse(data.meta) }catch(err){ onError('The meta is damaged') };

    const VerifiJson = {
        profile : {
            auth : [1],
            verification : {
                1 : {
                    image : {},
                    nickname : {
                        // 1초 = 1
                        // 1분 = 1 * 60
                        // 1시 = 1 * 60 * 60
                        // 1일 = 1 * 60 * 60 * 24
                        // 1일 = 1d
                        time : '1d'
                    },
                    description : {},
                }
            }
        }
    }

    const VerifiAuth = () => {
        let TempData = undefined;
        VerifiJson['profile'].auth.forEach(item => {
            (user.access.auth > item) ? TempData = item : undefined;
        });

        if(TempData == undefined){
            throw new Error({ message : 'You do not have permission' });
        }else{
            return TempData;
        }
    }

    const Verification = () => {
        const auth = VerifiAuth();

        if(typeof VerifiJson.verification[auth] == 'object'){
            // 이미지 변경 권한
            if(typeof data.meta.image == 'object'){
                console.log(typeof data.meta.image.change);
                if(typeof data.meta.image.change == 'boolean' || typeof data.meta.image.change == 'string'){
                    if(data.meta.image.change == true){
                        if(typeof VerifiJson.verification[auth].image){
                            // 이미지 변경 가능
                        }
                    }
                }
            }

            // 닉네임 변경 권한
            if(typeof data.meta.nickname == 'object'){
                console.log(typeof data.meta.nickname.change);
                if(typeof data.meta.nickname.change == 'boolean' || typeof data.meta.nickname.change == 'string'){
                    if(data.meta.nickname.change == true){
                        if(typeof VerifiJson.verification[auth].nickname == 'object'){
                            if(typeof VerifiJson.verification[auth].nickname.time == 'string' || typeof VerifiJson.verification[auth].nickname.time == 'number'){
                                // 시간 조회
                            }
                        }
                    }
                }
            }

            // 설명글 변경 권한
            if(typeof data.meta.description == 'object'){
                console.log(typeof data.meta.description.change);
                if(typeof data.meta.description.change == 'boolean' || typeof data.meta.description.change == 'string'){
                    if(data.meta.description.change == true){
                        if(typeof VerifiJson.verification[auth].description == 'object'){
                            // 테그 권한 부여
                        }
                    }
                }
            }
        }else{
            throw new Error({ message : 'You do not have permission' });
        }
    }

    const RunCommand = async () => {
        try {
            Verification();
            onResponse(req.body);
        }catch(err){
            onError(err);
        }
    }
    RunCommand();
}

module.exports = Profile;
