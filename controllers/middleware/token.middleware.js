const Schema = require('../../models/functions/index');
const jwt = require('jsonwebtoken');
const secretToken = require('../../models/helper/secret-token');

const Token = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-resecret');
    const token = secretToken.decorative(req.cookies._SESSION);

    const onError = async (err) => {
        err = (typeof err == 'object' || typeof err == 'string') ? err : {};
        (typeof err.message != 'string') ? err.message = false : undefined;
        console.log(err);
        res.locals.token = { status : false, error : err.message };
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
                                TokenEexpired().then(VerificationRe).then(Issued).then(onSession).then(ReResponse).catch(onError);
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
        Schema.SESSION.Read.Verification({ access : token.access, type : false }).then((req) => {
            const payload = {
                status: 'success',
                message: 'Token authentication complete',
                info : {
                    index : req.users._id,
                    userid : req.users.userid,
                    nickname : req.users.nickname,
                    meta : {
                        thumbnail : (typeof req.users.meta.thumbnail == 'string' || typeof req.users.meta.thumbnail == 'object') ? req.users.meta.thumbnail : false,
                        description : (typeof req.users.meta.description == 'string') ? req.users.meta.description : false,
                    },
                    access : {
                        auth: req.users.info.auth,
                        rank: req.users.info.rank,
                        point: req.users.info.point,
                        check: req.users.info.check,
                        experience: req.users.info.experience
                    }
                }
            };

            console.log("토큰 인증됨");
            res.locals.token = payload;
            next();
        }).catch((err) => {
            throw new Error(err.message);
        })
    }

    const ReResponse = (req) => {
        console.log("재발급됨");
        res.cookie('_SESSION', secretToken.encryption(req.token), { httpOnly: true });
        const payload = {
            status: 'success',
            message: 'Token reissuance success',
            info : req.info
        };

        res.locals.token = payload;
        next();
    }

    // 리플래시 검증
    const VerificationRe = async (data) => {
        return new Promise((resolve, reject) => {
            Schema.SESSION.Read.Verification({ access : token.access, refresh : token.refresh, type : false }).then((req) => {
                resolve(req);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    const Issued = async (req) => {
        return new Promise((resolve, reject) => {
            try {
                const data = {
                    token : {
                        access : jwt.sign( { _id: req.index }, secret, { expiresIn: secretToken.AccessTime, }),
                        refresh : jwt.sign( { _id: req.index }, ReSecret, { expiresIn: secretToken.RefreshTime, })    
                    },
                    info : {
                        index : req.users._id,
                        userid : req.users.userid,
                        nickname : req.users.nickname,
                        meta : {
                            thumbnail : (typeof req.users.meta.thumbnail == 'string' || typeof req.users.meta.thumbnail == 'object') ? req.users.meta.thumbnail : false,
                            description : (typeof req.users.meta.description == 'string') ? req.users.meta.description : false,
                        },
                        access : {
                            auth: req.users.info.auth,
                            rank: req.users.info.rank,
                            point: req.users.info.point,
                            check: req.users.info.check,
                            experience: req.users.info.experience
                        }
                    }
                };
                resolve(data);
            }catch(err){
                reject(err);
            }
        });
    }

    const onSession = async (req) => {
        try {
            return new Promise((resolve, reject) => {
                const data = {
                    index: req.info.index,
                    client: JSON.stringify(client),
                    access: req.token.access,
                    refresh: req.token.refresh
                }

                Schema.SESSION.Write.Create(data).then(() => {
                    resolve(req);
                }).catch(() => {
                    reject('db error');
                })
            })
        } catch(e){
            throw new Error('db error');
        }
    }

    // 토큰기간 만료
    const TokenEexpired = async () => {
        return new Promise((resolve, reject) => {
            jwt.verify(token.refresh, ReSecret, (err, decoded) => {
                if(err){
                    reject(err);
                }else{
                    resolve({ decode: decoded })
                }
            });
        });
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
