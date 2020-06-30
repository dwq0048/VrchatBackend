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
    info : {
        userId : { type : String }, // 업로드 유저 아이디
        userName : { type : String }, // 업로드 유저 이름
        ip : { type : String }, // 업로드 유저 아이피
        userAgent : { type : String }, // 업로드 user-agent
        date : { type : String, default: Date }, // 업로드 날짜
        postPath : { type : String }    // 업로드 했던곳
    }
}, { collection: 'gl_image', versionKey: false });

Image.statics.create = function(data){
    const image = new this(data);
    
    return image.save();
}

module.exports = mongoose.model('Image', Image, true)

/*
{ 
    fieldname: 'images',
    originalname: '480466038.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: './public/uploads/images/',
    filename: '3328ab53ddea9ce182af05bf6a092c4b',
    path: 'public\\uploads\\images\\3328ab53ddea9ce182af05bf6a092c4b',
    size: 135357,
    info: {
        userId: 'dwq0048',
        userName: '후리하',
        ip: '::ffff:127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
        path: 'board/notice'
    }
}
*/
