const mongoose = require('mongoose');

const File = new mongoose.Schema({
    name : { type : String }, // 파일 이름
    position : { type : String }, // 파일 위치
    type : { type : String }, // 파일 확장자
    size : { type : Number }, // 파일 사이즈
    user : { type : String }, // 업로드 유저 고유번호
    date : { type : String, default: Date }, // 업로드 날짜,
    state : { type : String, defaukt: 0 }, // 상태, 삭제 등등
}, { collection: 'gl_file', versionKey: false });