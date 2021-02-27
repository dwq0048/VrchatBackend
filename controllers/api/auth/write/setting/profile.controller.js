const Schema = require('../../../../models/functions');

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
        image : {
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

    // 무언가 지역 변수로 변경하는지 안하는지 저장해야댐
    const Verification = () => {
        const auth = VerifiAuth();
        if(typeof VerifiJson['profile'].verification[auth] == 'object'){
            // 이미지 변경 권한
            if(typeof data.meta.image == 'object'){
                if(typeof data.meta.image.change == 'boolean' || typeof data.meta.image.change == 'string'){
                    if(data.meta.image.change == true){
                        if(typeof VerifiJson['profile'].verification[auth].image){
                            // 이미지 변경 가능
                            console.log('Enable Image');

                            Enable.image.change = true
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
                                console.log('Enable Nickname');

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
                            console.log('Enable Description');

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

    const Technology = () => {
        // 이미지 변경 가능
        if(Enable.image.change){
            // const LoadImage = require('./profile.image.controller.js');
            // Images DB 업로드 및 Profile에 Insert?
            // RequestData.image = {
            //      options??????
            // }
        }

        // 닉네임 변경 가능
        if(Enable.nickname.change){
            // RequestData.nickname = [[ 변경한 닉네임 ]]
        }

        // 설명글 변경 가능
        if(Enable.description.change){
            // RequestData.description == [[ 변경한 설명글 ]]
        }
        
        return RequestData;
    };

    const InsertPost = () => {
        // 스키마 제작
        // InsertMany ?? create??
        const array = [
            // Profile Thumbnail
            {
                index : { }, // Post User Primary Key,
                // Default of Date
                type : 'thumbnail',
                meta : {
                    thumbnail : {
                        index : { }, // Images Primary Key
                    }
                }
            },
            // Profile Nickname
            {
                index : { }, // Post User Primary Key,
                type : 'nickname',
                meta : {
                    nickname : '닉네임' // Change of nickname
                }
            },
            // Profile Description
            {
                index : { }, // Post User Primary Key,
                type : 'description',
                meta : {
                    description : '설명글' // Change of nickname
                }
            },
            // Profile Log
            {
                index : { }, // Post User Primey Key,
                type : 'profile_log',
                meta : {
                    change : [ 'thumbnail', 'nickname', 'description' ] // Enable Meta Insert to Array
                }
            },
        ];

        // User Collection need more table of description
        const object = {
            index : { }, // Post User Primary Key
            nickname : '닉네임', // Change of nickname
            meta : {
                description : '설명', // Add Table Meta for description
                thumbnail : {
                    path : './path', // Thumbnail Path or Upload Image Collection's Primary Key
                    type : 'default'
                }
            }
        }
    };

    const RunCommand = async () => {
        try {
            Verification();
            // await Technology();
            onResponse(req.body);
        }catch(err){
            onError(err);
        }
    };
    RunCommand();
}

module.exports = Profile;
