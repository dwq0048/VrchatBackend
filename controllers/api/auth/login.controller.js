const jwt = require('jsonwebtoken');
const Schema = require('../../../models/functions');
const secretToken = require('../../../models/helper/secret-token');


const login = async (req, res, next) => {
    const onResponse = (token) => {
        if(process.env.USERNAME == "Luochi"){
            res.cookie('_SESSION', secretToken.encryption(token.token), { httpOnly: true }) .status(200).json({ status: 'success', info: token.info });
        }else{
            res.cookie('_SESSION', secretToken.encryption(token.token), { secure: true }) .status(200).json({ status: 'success', info: token.info });
        }
    }
    const onError = (err) => { console.log(err); res.status(200).json({ status: 'fail', message: err.message }) };
    (!req.body || typeof req.body != 'object') ? onError({ message : 'Unknown error' }) : undefined;

    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-resecret');

    const client = { userAgent : req.headers["user-agent"] || req.get('User-Agent') }
    const payload = {
        userid : ( typeof req.body.USER_ID == 'string' ) ? req.body.USER_ID : false,
        userpw : ( typeof req.body.USER_PW == 'string' ) ? req.body.USER_PW : false,
    }

    const onToken = async (user) => {
        if(user){
            if(user.verify(payload.userpw)){
                return new Promise((resolve, reject) => {
                    try {
                        const data = {
                            token : {
                                access : jwt.sign( { _id: user._id }, secret, { expiresIn: secretToken.AccessTime, }),
                                refresh : jwt.sign( { _id: user._id }, ReSecret, { expiresIn: secretToken.RefreshTime, })    
                            },
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
                        resolve(data);
                    } catch (e){
                        reject(e);
                    }
                })
            }else{
                throw new Error('User is Wrong');
            }
        }else{
            throw new Error('User is Wrong');
        }
    }

    const onSession = async (token) => {
        try {
            return new Promise((resolve, reject) => {
                const data = {
                    index: token.info.index,
                    client: JSON.stringify(client),
                    access: token.token.access,
                    refresh: token.token.refresh
                }

                Schema.SESSION.Write.Create(data).then(() => {
                    resolve(token);
                }).catch(() => {
                    reject('db error');
                })
            })
        } catch(e){
            throw new Error('db error');
        }
    }

    const RunCommand = async () => {
        Schema.USER.Read.FindByID({ userid : payload.userid }).then(onToken).then(onSession).then(onResponse).catch(onError);
    }
    RunCommand();

}

module.exports = login;
