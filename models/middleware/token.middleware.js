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
    const access = new Promise((resolve, reject) => {
        jwt.verify(token.access, secret, (err, decoded) => {
            if(err) reject(err);

            resolve({decode: decoded});
        })
    })

    // 리플레시 토큰 검증
    const refresh = new Promise((resolve, reject) => {
        jwt.verify(token.refresh, ReSecret, (err, decoded) => {
            if(err) reject(err);

            resolve({
                decode: decoded
            });
        });
    })

    // 만료된 토큰 리플레시 토큰 검증
    // 엑세스 토큰만 재발급 및 SESSION DB 업그레이드
    const issued = (decoded) => {
        return new Promise((resolve, reject) => {
            Session.findOneByToken(token.refresh).then((req) => {
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
    const check = (err) => {
        switch(err.name){
            case 'TokenExpiredError':
                accessExpired();
                break;
            default:
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
    const respondExpired = (reToken) => {
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

            //res.cookie('_SESSION', result).status(200).json(payload);
            console.log("토큰 문제 없음...");
            res.locals.payload = payload;
            res.locals.result = result;

            next();
        }).catch((e) => {
            onError(e);
        });
    }

    // 에러
    const onError = (err) => {
        const payload = {
            status: 'fail',
            message: err.message
        }

        //res.status(200).json(payload);
        res.locals.payload = payload;

        next();
    }

    access.then(respond).catch(check)
}

module.exports = token;
