const mongoose = require('mongoose');

const Post = new mongoose.Schema({
    title : { type : String }, // 제목
    board : { type : String }, // 게시판 종류
    user : {
        userid : { type : String }, // 글쓴이 아이디
        userKey : { type : String }, // 글쓴이 고유번호
        name : { type : String }, // 글쓴이 이름
        nickname : { type : String }, // 글쓴이 닉네임
    },
    type : {
        state : { type : Number, default : 2 }, // 포스트 비밀번호 사용 여부 같은거 
        password : { type : String }, // 비밀번호가 있다면 비밀번호
        skin : { type : String }, // 글에 따라 스킨이 다르다면
    },
    state : {
        date : { type : String, default : Date }, // 글쓴 날짜
        date_fix : { type : String, default: Date }, // 수정 날짜
    },
    images : [],
    files: [],
    meta : { type : Object },
    post : { type : String } // 글
    /*

    meta : {
        files : [
            0 : {
                name : { type : String }, // 파일 이름
                key : { type : String }, // 파일 유니크 이름
                type : { type : String }, // 파일 확장자
                size : { type : Number }, // 바이트 단위의 파일 사이즈
                user : { type : String }, // 업로드 유저 고유번호
                date : { type : String, default: Date }, // 업로드 날짜
                state : { type : Number, default: 0 } // 글 상태, 삭제 여부
            },
            1 : { ... },
            2 : { ... }
        ],
        images : [
            0 : {
                name : { type : String }, // 파일이름
                key : { type : String }, // 파일 유니크 이름
                address : { type : String }, // 이미지 주소
            },
            1 : { ... },
            2 : { ... }
        ],
        thumbnail : [
            0 : {
                name : { type : String }, // 이미지 이름
                key : { type : String }, // 이미지 유니크 이름
                address : { type : String } // 이미지 주소
            }
        ]
        tag : [
            0 : {
                name : { type : String }, // 테그 이름 같은거
                key : { type : String }, // 테그 유니크 이름
            }
        ]
    }

    */
}, { collection: 'bd_post', versionKey: false });

Post.statics.create = function(data){
    const post = new this(data);
    
    return post.save();
}

Post.statics.list = function(data){
    const post = new this(data);
    
    return post.find({}).sort(['state.date', -1]).skip(0).limit(15);
}

module.exports = mongoose.model('Post', Post, true)
