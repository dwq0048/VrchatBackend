//const jwt = require('jsonwebtoken');
//const User = require('../../../models/schema/user');
//const Session = require('../../../models/schema/session');

//const secretToken = require('../../../models/helper/secret-token');

const test = (req, res, next) => {
    const payload = res.locals.payload;

    const respond = (payload) => {
        console.log()
        if(payload.message == 'Issued Success'){
            res.cookie('_SESSION', res.locals.result).status(200).json(payload);
        }else if(payload.message == 'Token authentication complete'){
            res.status(200).json(payload);
        }else{
            onError({ message: 'idk' })
        }
    }

    const onError = (err) => {
        res.status(200).json({
            status: 'fail',
            message: err.message
        })
    }

    if(payload.status == 'success'){            
        respond(payload)
    }else{
        onError(payload)
    }
}

/*
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
            if(err) reject(err)

            resolve({
                decode: decoded
            })
        })
    })

    // 리플레시 토큰 검증
    const refresh = new Promise((resolve, reject) => {
        jwt.verify(token.refresh, ReSecret, (err, decoded) => {
            if(err) reject(err)
            resolve({
                decode: decoded
            })
        })
    })

    // 만료된 토큰 리플레시 토큰 검증
    // 엑세스 토큰만 재발급 및 SESSION DB 업그레이드
    const issued = (decoded) => {
        return new Promise((resolve, reject) => {
            Session.findOneByToken(token.refresh).then((req) => {
                if(req.verify(client, decoded.decode.userid, token.access)){
                    const data = {
                        access : jwt.sign( { _id: decoded.decode._id, userid: decoded.decode.userid }, secret, { expiresIn: '30s', }),
                        userid : decoded.decode.userid,
                    }
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
                onError(err)
        }
    }

    // 만료된 토큰 검증
    const accessExpired = () => {
        refresh.then((decode) => {
            issued(decode).then((reToken) => {
                respondExpired(reToken)
            }).catch(onError)
        }).catch(onError)
    }

    // 정상적인 토큰일 경우 전송
    const respond = (json) => {
        User.findOneByUserId(json.decode.userid).then((user) => {
            res.status(200).json({
                message: 'Token authentication complete',
                info : {
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
            })
        }).catch((e) => {
            onError(e);
        })

    }

    // 만료된 토큰 재발급 전송
    const respondExpired = (reToken) => {
        User.findOneByUserId(reToken.userid).then((user) => {
            reToken.refresh = token.refresh;

            const result = secretToken.encryption(reToken);
            res.cookie('_SESSION', result)
            .status(200).json({
                message: 'Issued Success',
                info : {
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
            });
        }).catch((e) => {
            onError(e);
        })
    }

    // 에러
    const onError = (err) => {
        res.status(200).json({
            status: 'fail',
            message: err.message
        })
    }

    access.then(respond).catch(check)
}
*/

module.exports = test;
