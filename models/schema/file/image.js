const mongoose = require('mongoose');

const Image = new mongoose.Schema({
    fieldname : { type : String }, // 기본 정보
    originalname : { type : String }, // 기본 정보
    encoding : { type : String }, // 기본 정보
    mimetype : { type : String }, // 기본 정보
    destination : { type : String }, // 기본 정보
    filename : { type : String }, // 기본 정보
    path : { type : String }, // 기본 정보
    size : { type : String }, // 기본 정보
    user : { type : mongoose.Schema.Types.ObjectId },
    info : {
        ip : { type : String }, // 아이피
        date : { type : String, default: Date }, // 업로드 날짜
        postPath : { type : String },    // 업로드 했던곳
        userAgent : { type : String }, // user-agent
        state : { type : String, default: 1 }, // 상태
        // 1 : 게시중
        // 2 : 사용하지 않음
        // 3 : 삭제함
    },
    meta : { type : Object },
}, { collection: 'gl_image', versionKey: false });

Image.statics.create = function(data){
    const image = new this(data);
    
    return image.save();
}

module.exports = mongoose.model('Image', Image, true);
