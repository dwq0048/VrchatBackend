const jwt = require('jsonwebtoken');
const User = require('../../../models/schema/user');
const Session = require('../../../models/schema/session');
const secretToken = require('../../../models/helper/secret-token');


const login = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-re-secret');

    // 클라이언트 정보
    const client = {
        userAgent : req.headers["user-agent"] || req.get('User-Agent'),
        host : req.ip || req.headers.host
    }

    // 전송받은 데이터
    const query = {
        userid : req.body.userid,
        password : req.body.password
    }

    // 로그인 검증
    const token = (user) => {
        if(user){
            if(user.verify(query.password)){
                return new Promise((resolve, reject) => {
                    try {
                        resolve({
                            token : {
                                access : jwt.sign( { _id: user._id, userid: user.userid }, secret, { expiresIn: '30s', }),
                                refresh : jwt.sign( { _id: user._id, userid: user.userid }, ReSecret, { expiresIn: '1d', })    
                            },
                            info : {
                                userid : user.userid,
                                name: user.name,
                                nickname: user.nickname,
                                email: user.email
                            }
                        });
                    } catch (e){
                        reject({
                            code: 003,
                            message: 'jwt error'
                        });
                    }
                })
            }else{
                throw new Error({
                    code: 002,
                    message: 'password error'
                })
            }  
        }else{
            throw new Error({
                code: 002,
                message: 'userid error'
            })
        }
    }

    // 최초 세션 등록
    const onSession = (token) => {
        try {
            return new Promise((resolve, reject) => {
                Session.create({
                    user: query.userid,
                    client: JSON.stringify(client),
                    access: token.token.access,
                    refresh: token.token.refresh
                }).then(() => {
                    resolve(token);
                }).catch(() => {
                    reject({
                        code: 004,
                        message: 'db error'
                    });
                })
            })
        } catch(e){
            throw new Error({
                code: 004,
                message: 'db error'
            });
        }
    }

    // 정상적일 경우 등록
    const respond = (token) => {
        const data = secretToken.encryption(token.token);

        res.cookie('_SESSION', data, { httpOnly: true })
        .status(200).json({
            message: 'Login Success',
            info: token.info
        });
    }

    // 에러
    const onError = (err) => {
        console.log(err);
        res.status(401).json(err);
    }

    User.findOneByUserId(query.userid)
    .then(token).then(onSession).then(respond).catch(onError);
}

module.exports = login;
