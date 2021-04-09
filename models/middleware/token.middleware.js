const jwt = require('jsonwebtoken');
const User = require('../schema/user');
const Session = require('../schema/session');

const secretToken = require('../helper/secret-token');

const token = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-re-secret');
    const token = secretToken.decorative(req.cookies._SESSION);

    // 클라이언트 정보
    const client = {
        userAgent : req.headers["user-agent"] || req.get('User-Agent'),
        host : req.ip || req.headers.host
    }

    // 엑세스 토큰 검증
    const access = async () => {
        return new Promise((resolve, reject) => {
            jwt.verify(token.access, secret, (err, decoded) => {
                if(err){
                    reject(err);
                }else{
                    resolve({decode: decoded});
                }
            })
        })
    }

    // 리플레시 토큰 검증
    /*
    const refresh = async () => {
        return new Promise((resolve, reject) => {
            try {
                await jwt.verify(token.refresh, ReSecret, (err, decoded) => {
                    if(err) {
                        reject(err);
                    }else{
                        resolve({ decode: decoded });
                    }
                });
            }catch(e){
                throw new Error('idk');
            }
        })
    }

    /*

    // 만료된 토큰 리플레시 토큰 검증
    // 엑세스 토큰만 재발급 및 SESSION DB 업그레이드
    const issued = async (decoded) => {
        return new Promise((resolve, reject) => {
            await Session.findOneByToken(token.refresh).then((req) => {
                if(req.verify(client, decoded.decode.userid, token.access)){
                    const data = {
                        access : jwt.sign( { _id: decoded.decode._id, userid: decoded.decode.userid }, secret, { expiresIn: '10m', }),
                        userid : decoded.decode.userid,
                    };

                    if(req.update(data)){
                        resolve(data);
                    }else{
                        throw new Error('DB is not working');
                    }
                }else{
                    throw new Error('Refresh token is different or unknown error');
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    // 만료된 토큰 일경우
    const check = async (err) => {
        switch(err.name){
            case 'TokenExpiredError':
                accessExpired();
                break;
            default:
                throw new Error('idk');
        }
    }

    // 만료된 토큰 검증
    const accessExpired = async () => {
        refresh().then((decode) => {
            await issued(decode).then((reToken) => {
                respondExpired(reToken);
            }).catch((err) => {
                throw new Error('idk');
            });
        }).catch((err) => {
            throw new Error('idk');
        })
    }

    // 정상적인 토큰일 경우 전송
    const respond = async (json) => {
        User.findOneByUserId(json.decode.userid).then((user) => {
            const payload = {
                status: 'success',
                message: 'Token authentication complete',
                info : {
                    index : user._id,
                    userid : user.userid,
                    name: user.name,
                    nickname: user.nickname,
                    email: user.email,
                    access : {
                        auth: user.meta.auth,
                        rank: user.meta.rank,
                        point: user.meta.point,
                        check: user.meta.check
                    }
                }
            };

            //res.status(200).json(payload);
            console.log("재발급 진행...");
            res.locals.payload = payload;

            next();
        }).catch((e) => {
            onError(e);
        });

    }

    // 만료된 토큰 재발급 전송
    const respondExpired = async (reToken) => {
        User.findOneByUserId(reToken.userid).then((user) => {
            reToken.refresh = token.refresh;
            const result = secretToken.encryption(reToken);
            const payload = {
                status: 'success',
                message: 'Issued Success',
                info : {
                    index : user._id,
                    userid : user.userid,
                    name: user.name,
                    nickname: user.nickname,
                    email: user.email,
                    access : {
                        auth: user.meta.auth,
                        rank: user.meta.rank,
                        point: user.meta.point,
                        check: user.meta.check
                    }
                }
            };
            console.log("토큰 문제 없음...");
            res.locals.payload = payload;
            res.locals.result = result;

            next();
        }).catch((e) => {
            onError(e);
        });
    }

    // 에러
    const onError = async (err) => {
        const payload = {
            status: 'fail',
            message: err.message
        }
        res.locals.payload = payload;

        next();
    }

    */

    access().then((data) => {
        console.log(data);
    }).catch((err) => {
        console.log(err);
    })
}

module.exports = token;
