const Schema = require('../../models/functions/index');
const jwt = require('jsonwebtoken');
const secretToken = require('../../models/helper/secret-token');

const Token = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-re-secret');
    const token = secretToken.decorative(req.cookies._SESSION);

    const onError = async (err) => {
        err = (typeof err == 'object' || typeof err == 'string') ? err : {};
        (typeof err.message != 'string') ? err.message = false : undefined;
        console.log(err);
        res.locals.token = { status : 'fail', error : err.message };
        next();
    }

    // 클라이언트 정보
    const client = { userAgent : req.headers["user-agent"] || req.get('User-Agent') }

    // 엑세스 토큰 검증
    const Access = async () => {
        if(!token){ throw new Error('Token is empty') };
        return new Promise((resolve, reject) => {
            try{
                jwt.verify(token.access, secret, (err, decoded) => {
                    if(err){
                        switch(err.message){
                            case 'jwt expired':
                                TokenEexpired();
                                break;
                            default:
                                reject(err);
                        }
                    }else{
                        resolve(decoded);
                    }
                })
            }catch(err){
                throw new Error(err.message);
            }
        })
    }

    const Verification = async (data) => {
        Schema.USER.Read.FindByID({ _id : data._id }).then((user) => {
            const payload = {
                status: 'success',
                message: 'Token authentication complete',
                info : {
                    index : user._id,
                    userid : user.userid,
                    nickname : user.nickname,
                    meta : {
                        thumbnail : (typeof user.meta.thumbnail == 'string' || typeof user.meta.thumbnail == 'object') ? user.meta.thumbnail : false,
                        description : (typeof user.meta.description == 'string') ? user.meta.description : false,
                    },
                    access : {
                        auth: user.info.auth,
                        rank: user.info.rank,
                        point: user.info.point,
                        check: user.info.check,
                        experience: user.info.experience
                    }
                }
            };

            console.log("재발급 진행...");
            console.log(payload);
            res.locals.payload = payload;

            next();
        }).catch((err) => {
            throw new Error(err.message);
        })
    }

    const TokenEexpired = () => {
        throw new Error('쿠쿠루삥뽕 토큰 기간 다됨ㅋㅋ');
    }

    // 리플레시 토큰 검증
    /*
    const refresh = new Promise((resolve, reject) => {
        try {
            if(token.refresh || token.refresh != undefined){
                jwt.verify(token.refresh, ReSecret, (err, decoded) => {
                    if(err){ reject(err) }else{ resolve({ decode: decoded }) }
                });
            }else{
                onError({ message : 'Refresh Error' });
            }
        }catch(err){
            onError({ message : 'Refresh Error', error : err });
        }
    })

    // 만료된 토큰 리플레시 토큰 검증
    const issued = (decoded) => {
        return new Promise((resolve, reject) => {
            Schema.SESSION.findOneByToken(token.refresh).then((req) => {
                if(req.verify(client, decoded.decode.userid, token.access)){
                    const data = {
                        access : jwt.sign( { _id: decoded.decode._id, userid: decoded.decode.userid }, secret, { expiresIn: secretToken.RefreshTime, }),
                        userid : decoded.decode.userid,
                    };
                    if(req.update(data)){ resolve(data) }else{ onError({ message : 'DB is not working' }) };
                }else{
                    onError({ message : 'Refresh token is different or unknown error' });
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    // 만료된 토큰 일경우
    const check = (err) => {
        if(err.name){
            switch(err.message){
                case 'jwt expired':
                    accessExpired();
                    break;
                case 'jwt must be provided':
                    onError(err);
                    break;
                default:
                    onError(err);
            }
        }else{
            onError(err);
        }
    }

    // 만료된 토큰 검증
    const accessExpired = () => {
        refresh.then((decode) => {
            issued(decode).then((reToken) => {
                respondExpired(reToken);
            }).catch(onError);
        }).catch(onError)
    }

    // 정상적인 토큰일 경우 전송
    const respond = (json) => {
        Schema.USER.findOneByUserId(json.decode.userid).then((user) => {
            const payload = {
                status: 'success',
                message: 'Token authentication complete',
                info : {
                    index : user._id,
                    userid : user.userid,
                    nickname : user.nickname,
                    meta : {
                        thumbnail : (typeof user.meta.thumbnail == 'string' || typeof user.meta.thumbnail == 'object') ? user.meta.thumbnail : false,
                        description : (typeof user.meta.description == 'string') ? user.meta.description : false,
                    },
                    access : {
                        auth: user.info.auth,
                        rank: user.info.rank,
                        point: user.info.point,
                        check: user.info.check,
                        experience: user.info.experience
                    }
                }
            };

            console.log("재발급 진행...");
            res.locals.payload = payload;

            next();
        }).catch((e) => {
            onError(e);
        });

    }

    // 만료된 토큰 재발급 전송
    const respondExpired = (reToken) => {
        Schema.USER.findOneByUserId(reToken.userid).then((user) => {
            reToken.refresh = token.refresh;
            const result = secretToken.encryption(reToken);
            const payload = {
                status: 'success',
                message: 'Issued Success',
                info : {
                    index : user._id,
                    userid : user.userid,
                    nickname : user.nickname,
                    meta : {
                        thumbnail : (typeof user.meta.thumbnail == 'string' || typeof user.meta.thumbnail == 'object') ? user.meta.thumbnail : false,
                        description : (typeof user.meta.description == 'string') ? user.meta.description : false,
                    },
                    access : {
                        auth: user.info.auth,
                        rank: user.info.rank,
                        point: user.info.point,
                        check: user.info.check,
                        experience: user.info.experience
                    }
                }
            };
            res.locals.payload = payload;
            res.locals.result = result;

            next();
        }).catch((e) => {
            onError(e);
        });
    }
    */

    Access().then(Verification).catch(onError);
}

module.exports = Token;
