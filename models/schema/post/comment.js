

const mongoose = require('mongoose');

const Comment = new mongoose.Schema({
    _parent : { type : mongoose.Schema.Types.ObjectId }, // 엄마
    title : { type : String }, // 제목
    board : { type : String }, // 게시판 종류
    user : { type : mongoose.Schema.Types.ObjectId, ref: "User" },
    type : {
        state : { type : String }, // 상태
        // 1 : 게시중
        // 2 : 게시 요청
        // 3 : 비공개 - post 하지 않음
        // 4 : 비공개
        // 5 : 관리자 권한으로 비공개 - 사유 같은거
        // 6 : 관리자 권한으로 비공개 - 그냥
        // 7 : 삭제
        // 8 : 완전 삭제 - 근데 완전은 아님
        password : { type : String }, // 비밀번호가 있다면 비밀번호
    },
    state : {
        date : { type : Date, default : Date.now }, // 글쓴 날짜
        date_fix : { type : Date, default: Date.now }, // 수정 날짜
    },
    images : [],
    files: [],
    meta : { type : Object },
    post : { type : String } // 글
}, { collection: 'bd_comment', versionKey: false });

Comment.statics.create = function(data){
    const post = new this(data);
    
    return post.save();
}

Comment.statics.page = function(data){
    //data.page = (data.page - 1);
    data.page = (data.page * data.view);
    return this.find({ board: data.board }).sort({'state.date': -1}).skip(data.page).limit(data.view);
}

module.exports = mongoose.model('Comment', Comment, true)
