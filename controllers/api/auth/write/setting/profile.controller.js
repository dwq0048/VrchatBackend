const Schema = require('../../../../../models/functions');
const LoadImage = require('./profile.image.controller.js');

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
    };
    let RequestData = {};

    try{ data.meta = JSON.parse(data.meta) }catch(err){ onError('The meta is damaged') };

    let Enable = {
        thumbnail : {
            change: false
        },
        nickname : {
            change : false
        },
        description : {
            change: false
        }
    }

    const VerifiJson = {
        profile : {
            auth : [1],
            verification : {
                1 : {
                    thumbnail : {},
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

    // 무언가 지역 변수로 변경하는지 안하는지 저장해야댐
    const Verification = () => {
        const auth = VerifiAuth();
        if(typeof VerifiJson['profile'].verification[auth] == 'object'){
            // 이미지 변경 권한
            if(typeof data.meta.thumbnail == 'object'){
                if(typeof data.meta.thumbnail.change == 'boolean' || typeof data.meta.thumbnail.change == 'string'){
                    if(data.meta.thumbnail.change == true){
                        if(typeof VerifiJson['profile'].verification[auth].thumbnail){
                            // 이미지 변경 가능
                            //console.log('Enable Thumbnail');

                            Enable.thumbnail.change = true
                        }
                    }
                }
            }

            // 닉네임 변경 권한
            if(typeof data.meta.nickname == 'object'){
                if(typeof data.meta.nickname.change == 'boolean' || typeof data.meta.nickname.change == 'string'){
                    if(data.meta.nickname.change == true){
                        if(typeof VerifiJson['profile'].verification[auth].nickname == 'object'){
                            if(typeof VerifiJson['profile'].verification[auth].nickname.time == 'string' || typeof VerifiJson['profile'].verification[auth].nickname.time == 'number'){
                                // 시간 조회 => 나중에
                                // 중복 조회
                                //console.log('Enable Nickname');

                                Enable.nickname.change = true
                            }
                        }
                    }
                }
            }

            // 설명글 변경 권한
            if(typeof data.meta.description == 'object'){
                if(typeof data.meta.description.change == 'boolean' || typeof data.meta.description.change == 'string'){
                    if(data.meta.description.change == true){
                        if(typeof VerifiJson['profile'].verification[auth].description == 'object'){
                            // 테그 권한 부여
                            //console.log('Enable Description');

                            Enable.description.change = true
                        }
                    }else{
                        // 설명글 변경 안함
                    }
                }
            }
        }else{
            throw new Error({ message : 'You do not have permission' });
        }
    }

    const Technology = async () => {
        // 이미지 변경 가능
        if(Enable.thumbnail.change){
            RequestData.thumbnail = await LoadImage(user, 0, req.files, data.meta);

        }

        // 닉네임 변경 가능
        if(Enable.nickname.change){
             RequestData.nickname = data.nickname;
        }

        // 설명글 변경 가능
        if(Enable.description.change){
            RequestData.description = data.description;
        }
        
        return RequestData;
    };

    const InsertUserMeta = async () => {
        let array = [];
        let LogRun = false;

        // Profile Thumbnail
        if(Enable.thumbnail.change){
            array.push({
                index : user.index,
                type : 'thumbnail',
                meta : { thumbnail : { index : { } } },
            });
            LogRun = true;
        };

        // Profile Nickname
        if(Enable.nickname.change){
            if(typeof RequestData.nickname == 'string'){
                array.push({
                    index : user.index,
                    type : 'nickname',
                    meta : { nickname : RequestData.nickname },
                });
                LogRun = true;
            }
        };

        // Profile Description
        if(Enable.description.change){
            if(typeof RequestData.description == 'string'){
                array.push({
                    index : user.index,
                    type : 'description',
                    meta : { description : RequestData.description },
                });
                LogRun = true;
            }
        };

        // Profile Log
        if(LogRun){
            let TempObject = {
                index : user.index,
                type : 'profile_log',
                meta : { change : [] },
            };

            if(Enable.thumbnail.change){ TempObject.meta.change.push('thumbnail') };
            if(Enable.nickname.change){ TempObject.meta.change.push('nickname') };
            if(Enable.description.change){ TempObject.meta.change.push('description') };
            (TempObject.meta.change.length > 0) ? array.push(TempObject) : false;
        };

        // Insert User Meta Schema
        Schema.USER_META.Write.InsertMany(array).then((req) => {
            console.log(req);
        }).catch((err) => {
            throw new Error(err);
        });
        
    };

    const InsertUser = (req) => {
        let InsertUser = [];
        
        req.map(item => {
            if(typeof item == 'object'){
                if(typeof item.type == 'string'){
                    for(list in Enable){
                        if(typeof Enable[list].change == 'boolean'){
                            if(Enable[list].change){
                                (list == item.type) ? InsertUser.push(list) : undefined
                            }
                        }
                    }
                }
            }
        });

        let object = { _id : user.index, meta : {} };
        InsertUser.map(item => {
            switch(item){
                case 'thumbnail':
                    if(typeof RequestData.thumbnail == 'object'){
                        if(typeof RequestData.thumbnail.list == 'object' && typeof RequestData.thumbnail.status == 'boolean'){
                            (RequestData.thumbnail.status && RequestData.thumbnail.list.length > 0) ? object.meta.thumbnail = RequestData.thumbnail.list[0] : undefined;
                        }
                    }
                    break;
                case 'nickname':
                    object.nickname = RequestData.nickname;
                    break;
                case 'description':
                    object.meta.description = RequestData.description;
                    break;
            }
        });

        Schema.USER.Write.Update(object).then((req) => {
            console.log(req);
        }).catch((err) => {
            throw new Error(err);
        })
    }

    const RunCommand = async () => {
        try {
            Verification();
            await Technology();
            const MetaData = await InsertUserMeta();
            InsertUser(MetaData);
            onResponse(req.body);
        }catch(err){
            onError(err);
        }
    };
    RunCommand();
}

module.exports = Profile;
