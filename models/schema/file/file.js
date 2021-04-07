const mongoose = require('mongoose');

const File = new mongoose.Schema({
    fieldname : { type : String }, // 기본 정보
    originalname : { type : String }, // 기본 정보
    encoding : { type : String }, // 기본 정보
    mimetype : { type : String }, // 기본 정보
    destination : { type : String }, // 기본 정보
    filename : { type : String }, // 기본 정보
    path : { type : String }, // 기본 정보
    size : { type : String }, // 기본 정보
    user : {
        index : { type : String }, // 업로드 유저 Primary Key
        userid : { type: String }, // 업로드 유저 아이디
        username : { type : String }, // 업로드 유저 이름
        nickname : { type : String }, // 업로드 유저 닉네임
    },
    info : {
        ip : { type : String }, // 아이피
        date : { type : String, default: Date }, // 업로드 날짜
        postPath : { type : String },    // 업로드 했던곳
        userAgent : { type : String }, // user-agent
        state : { type : String }, // 상태
        // 1 : 게시중
        // 2 : 사용하지 않음
        // 3 : 삭제함
    },
    meta : { type : Object },
}, { collection: 'gl_file', versionKey: false });

module.exports = mongoose.model('File', File, true)
