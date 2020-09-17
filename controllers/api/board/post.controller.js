const Schema = require('../../../models/functions');
const ImageLoader = require('./post.images.controller');
const sanitizeHtml = require('sanitize-html');


const post = (req, res, next) => {
    // Response Result
    const onResponse = (payload) => {
        res.status(200).json({
            state : 'success',
            payload
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

    let Request = {};
    let UpdateRequest = {};


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

    const InsertPost = async () => {
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
        
        await Schema.POST.Create(object).then((req) => {
            Request = { status : true, payload : req }
        }).catch((e) => {
            throw new Error(e.message);
        })
        
        return Request;
    }

    const UpdatePost = async (index, image) => {
        const data = {
            index : index,
            image : image
        };

        await Schema.POST.Update(data).then((req) => {
            UpdateRequest = { status : true, payload : req }
        }).catch((error) => {
            throw new Error(error.message);
        })

        return UpdateRequest;
    }

    const RunCommand = async () => {
        try{
            Verification();
            const ResultPost = await InsertPost();
            const ResultImage = await ImageLoader(user, ResultPost.payload._id, req.files);

            if(ResultPost.status && ResultImage.status){
                const ResultUpdate = await UpdatePost(ResultPost.payload._id, ResultImage.list);
                if(ResultUpdate.status){
                    onResponse(ResultPost.payload);
                }else {
                    throw new Error('Update error');
                }
            }else{
                throw new Error('Unknown error');
            }
        } catch (error){
            console.log(error);
            onError(error.message);
        }
    }
    RunCommand();

}

module.exports = post;
