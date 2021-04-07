const Schema = {
    USER : require('../../../models/schema/user/user'),
    SESSION :  require('../../../models/schema/user/session')
}

const jwt = require('jsonwebtoken');
const secretToken = require('../../../models/helper/secret-token');


const login = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-re-secret');

    // 클라이언트 정보
    const client = {
        userAgent : req.headers["user-agent"] || req.get('User-Agent'),
        //host : req.ip || req.headers.host
    }

    // 전송받은 데이터
    const payload = {
        userid : req.body.USER_ID,
        userpw : req.body.USER_PW
    }

    // 로그인 검증
    const token = (user) => {
        if(user){
            if(user.verify(payload.userpw)){
                return new Promise((resolve, reject) => {
                    try {
                        resolve({
                            token : {
                                access : jwt.sign( { _id: user._id, userid: user.userid }, secret, { expiresIn: secretToken.AccessTime, }),
                                refresh : jwt.sign( { _id: user._id, userid: user.userid }, ReSecret, { expiresIn: secretToken.RefreshTime, })    
                            },
                            info : {
                                index : user._id,
                                userid : user.userid,
                                access : {
                                    auth: user.info.auth,
                                    rank: user.info.rank,
                                    point: user.info.point,
                                    check: user.info.check,
                                    experience: user.info.experience
                                }
                            }
                        });
                    } catch (e){
                        console.log(e);
                        reject('jwt error');
                    }
                })
            }else{
                throw new Error('User PW is wrong')
            }  
        }else{
            throw new Error('User ID is wrong')
        }
    }

    // 최초 세션 등록
    const onSession = (token) => {
        try {
            return new Promise((resolve, reject) => {
                Schema.SESSION.create({
                    user: payload.userid,
                    client: JSON.stringify(client),
                    access: token.token.access,
                    refresh: token.token.refresh
                }).then(() => {
                    resolve(token);
                }).catch(() => {
                    reject('db error');
                })
            })
        } catch(e){
            throw new Error('db error');
        }
    }

    // 정상적일 경우 등록
    const respond = (token) => {
        const data = secretToken.encryption(token.token);

        res.cookie('_SESSION', data, { httpOnly: true })
        .status(200).json({
            status: 'success',
            info: token.info
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

    Schema.USER.findOneByUserId(payload.userid)
    .then(token).then(onSession).then(respond).catch(onError);
}

module.exports = login;
