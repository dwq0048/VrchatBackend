const mongoose = require('mongoose');

const User = new mongoose.Schema({
    userid : { type : String, unique  : true }, // 아이디
    password : { type : String }, // 비밀번호
    name : { type : String }, // 사용자 이름
    nickname : { type : String, unique : true }, // 사용자 닉네임
    email : { type : String, unique : true }, // 이메일
    type : { type : String, default : 0 }, // 가입경로 (일반, 페이스북, 구글, ...)
    meta : { 
        sex : { type : String }, // 성별
        number : { type : String }, // 번호
        address : { type : String }, // 주소
        profile : { type : Array },
        auth : { type : Number, default : 1 }, // 관리 권한
        rank : { type : Number, default : 1 }, // 사용자 권한
        experience : { type : Number, default : 0 }, // 사용자 경험치
        point : { type : Number, default : 0 }, // 사용자 포인트
        check : { type : Number, default : 1 }, // 이메일 등등 인증
        state : { type : String, default : 0 }, // 일반, 휴먼, 탈퇴 등등..
        first_join : { type : String, default : Date }, // 가입날짜
        last_login : { type : String, default : Date } // 최근 로그인
    }
}, { collection: 'gl_user', versionKey: false });

User.statics.create = function(data){
    const user = new this(data);
    
    return user.save();
}

User.statics.findOneByUserId = function(userid){
    return this.findOne({
        userid
    }).exec()
}

User.methods.verify = function(password){
    return this.password == password
}

module.exports = mongoose.model('User', User, true)
