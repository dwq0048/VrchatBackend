const Post = require('../../../models/schema/post');
const Image = require('../../../models/schema/image');

const sanitizeHtml = require('sanitize-html');

const user = {
    userid : 'dwq0048',
    userKey : '123123',
    name : '개발중',
    nickname : '후리하'
}

const post = (req, res, next) => {
    const data = {
        position : req.body.position,
        title : req.body.title,
        post : req.body.post
    }

    const images = [];
    const files = [];

    for(let i=0;i<req.files.length;i++){
        if(req.files[i].fieldname == 'images'){
            images.push(req.files[i]);
        }
    }

    let clean = sanitizeHtml(data.post ,{
        allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 's', 'i', 'strong', 'a', 'p', 'hr', 'br', 'ul', 'ol', 'li', 'blockquote', 'img', 'iframe' ],
        allowedAttributes: {
            'a': [ 'href', 'name', 'target' ],
            '*': [ 'style' ],
            'img': [ 'data-index', 'src' ]
        },
        allowedStyles: {
            '*': {
                'text-align': [/^left$/, /^right$/, /^center$/]
            }
        },
        allowedIframeHostnames: ['www.youtube.com'],
        transformTags: {
            'img': function(tagName, attribs) {
                let imageIndex = attribs['data-index'];
                let imagePath = '/images/'
                let imageName = images[imageIndex].filename;

                return {
                    tagName: 'img',
                    attribs: {
                        src: imagePath+imageName
                    }
                };
            }
          }
    });

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

    for(let i=0;i<images.length;i++){
        images[i].info = {
            userId : user.userid,
            userName : user.nickname,
            ip : req.ip || req.headers.host,
            userAgent : req.headers["user-agent"] || req.get('User-Agent'),
            postPath : 'board/notice'
        }
    }

    //console.log(images);

    //Image.create(images).then((req) => {
    Image.insertMany(images).then((req) => {

        const array = [];
        for(let i=0;i<req.length;i++){
            array.push(req[i]._id);
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
            post : data.post,
            images: array
        }).then((req) => {
            success({ id : req._id });
        }).catch((e) => {
            error(e);
        })   
    }).catch((e) => {
        error(e);
    })

}

module.exports = post;
