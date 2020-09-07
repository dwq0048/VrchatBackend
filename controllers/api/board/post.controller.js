const Schema = require('../../../models/functions');

const { promisify } = require('util');
const sharp = require("sharp");
const sizeOf = promisify(require('image-size'));
const sanitizeHtml = require('sanitize-html');

const Today = Schema.HELP.formatDate(Date.now());

const post = (req, res, next) => {
    // Response Result
    const onResponse = (result) => {
        res.status(200).json({
            state : 'success',
            result
        });
    }

    const onError = (message) => {
        res.status(401).json({
            state : 'error',
            message : message
        });
    }
    // Response Result End

    const LocalPayload = res.locals.payload;
    
    const user  = {
        index : LocalPayload.info.index,
        userid : LocalPayload.info.userid
    }

    const data = {
        board : req.body.board,
        title : req.body.title,
        content : req.body.content,
        meta : req.body.meta
    };

    let RequestData = {
        title : '',
        content : ''
    }


    // Setting Option
    const AllowedTags = {
        title : {
            1 : {
                allowedTags: false,
                allowedAttributes: false
            }
        },
        content : {
            1 : {
                allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'i', 's', 'a', 'p', 'hr', 'br', 'ul', 'ol', 'li', 'blockquote', 'img', 'iframe' ],
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
            }
        },
    }

    
    // Setting Option End

    const Verification = () => {
        // 토큰 검증
        if(!LocalPayload || LocalPayload.status == 'fail'){
            throw new Error('Token error');
        }

        // 제목이 없을 경우
        if(!data.title || data.title == undefined || data.title == ''){
            throw new Error('There is no title');
        }

        // 내용이 없을 경우
        if(!data.content || data.content == undefined || data.content == ''){
            throw new Error('There is no content');
        }

        RequestData.title = SetHtml('title', data.title);
        RequestData.content = SetHtml('content', data.content);
    }

    const SetHtml = (position, text) => {
        let Setting = {};
        (AllowedTags[position][1].allowedTags) ? Setting.allowedTags = AllowedTags[position][1].allowedTags : undefined;
        (AllowedTags[position][1].allowedAttributes) ? Setting.allowedAttributes = AllowedTags[position][1].allowedAttributes : undefined;
        (AllowedTags[position][1].allowedStyles) ? Setting.allowedStyles = AllowedTags[position][1].allowedStyles : undefined;
        (AllowedTags[position][1].allowedIframeHostnames) ? Setting.allowedIframeHostnames = AllowedTags[position][1].allowedIframeHostnames : undefined;
        
        return sanitizeHtml(text , Setting);
    }

    const InsertPost = () => {
        const object = {
            title : RequestData.title,
            board : data.board,
            user : user.index,
            type : {
                state : 1,
                password : '',
                skin : ''
            },
            post : RequestData.content
        }
        
        onError('success');
        /*
        Schema.POST.create(object).then((req) => {
            onResponse({ id : req._id });
        }).catch((e) => {
            onError(e.message);
        })
        */
    }

    const RunCommand = async () => {
        try{
            Verification();
            InsertPost();    
        } catch (error){
            console.log(error);
            onError(error.message);
        }
    }
    RunCommand();

}

console.log('run Post');

module.exports = post;
