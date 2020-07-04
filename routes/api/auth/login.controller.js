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
        userpw : req.body.userpw
    }

    // 로그인 검증
    const token = (user) => {
        if(user){
            if(user.verify(query.userpw)){
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
                                email: user.email,
                                access : {
                                    auth: user.meta.auth,
                                    rank: user.meta.rank,
                                    point: user.meta.point,
                                    check: user.meta.check
                                }
                            }
                        });
                    } catch (e){
                        reject('jwt error');
                    }
                })
            }else{
                throw new Error('password error')
            }  
        }else{
            throw new Error('userid error')
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
        res.status(200).json({
            status: 'fail',
            message: err.message
        });
    }

    User.findOneByUserId(query.userid)
    .then(token).then(onSession).then(respond).catch(onError);
}

module.exports = login;
