const Post = require('../../../models/schema/post');
const sanitizeHtml = require('sanitize-html');

const post = (req, res, next) => {
    const data = {
        position : req.body.position,
        title : req.body.title,
        post : req.body.post
    }

    console.log(req.body);
    //console.log(req.files);

    const images = [];
    const files = [];

    for(let i=0;i<req.files.length;i++){
        if(req.files[i].fieldname == 'images'){
            images.push(req.files[i]);
        }
    }

    console.log(images);

    let clean = sanitizeHtml(data.post ,{
        allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 's', 'i', 'strong', 'a', 'p', 'hr', 'br', 'ul', 'ol', 'li', 'blockquote', 'img', 'iframe' ],
        allowedAttributes: {
            'a': [ 'href', 'name', 'target' ],
            '*': [ 'style' ],
            'img': [ 'data-index' ]
        },
        allowedStyles: {
            '*': {
                'text-align': [/^left$/, /^right$/, /^center$/]
            }
        },
        allowedIframeHostnames: ['www.youtube.com'],
    });

    const user = {
        userid : 'dwq0048',
        userKey : '123123',
        name : '개발중',
        nickname : '후리하'
    }

    //검증
    const verification = () => {
        if(!data.position || data.position == '' || data.position == undefined){
            throw new Error({
                message : 'position'
            })
        }

        if(!data.title || data.title == '' || data.title == undefined){
            throw new Error({
                message : 'title'
            })
        }

        if(!data.post || data.post == '' || data.post == undefined){
            throw new Error({
                message : 'post'
            })
        }
    }

    const success = (result) => {
        res.status(200).json({
            state : 'success',
            result
        });
    }

    const error = (e) => {
        res.status(401).json({
            state : 'error',
            e
        })
    }
    

    try{
        verification;
    }catch(e){
        error;
    }

    Post.create({
        title : data.title,
        board : data.position,
        user : {
            userid : user.userid,
            userKey : user.userKey,
            name : user.name,
            nickname : user.nickname
        },
        type : {
            state : 2,
            password : '',
            skin : ''
        },
        post : data.post
    }).then((req) => {
        success({ id : req._id });
    }).catch((e) => {
        error(e);
    })   

}

module.exports = post;
