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
        userid : LocalPayload.info.userid,
        access : LocalPayload.info.access
    }

    let data = {
        board : req.body.board,
        title : req.body.title,
        content : req.body.content,
        meta : req.body.meta
    }

    try{ data.meta = JSON.parse(data.meta) }catch(err){ onError('The meta is damaged') }

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
    const VerifiJson = {
        notice : {
            auth : [1],
            verification : {
                1 : {
                    title : {
                        command : true,
                        setting : 1
                    },
                    content : {
                        command : true,
                        setting : 1 
                    },
                    category : ['default'],
                    admissionMeta : ['category', 'openSetting', 'hash'],
                    openSetting : ['search', 'anonymous', 'private']
                },
            }
        },
        free : {
            auth : [1],
            verification : {
                1 : {
                    title : {
                        command : true,
                        setting : 1
                    },
                    content : {
                        command : true,
                        setting : 1 
                    },
                    category : ['default'],
                    admissionMeta : ['category', 'openSetting', 'hash'],
                    openSetting : ['search', 'anonymous', 'private']
                },
            }
        },
        photo : {
            auth : [1],
            verification : {
                1 : {
                    title : {
                        command : true,
                        setting : 1
                    },
                    content : {
                        command : true,
                        setting : 1 
                    },
                    category : ['default'],
                },
            }
        }
    }

    const BoardList = ['notice', 'free', 'photo'];

    const VerifiAuth = (board) => {
        let garbage = undefined;
        BoardList.forEach(item => { if(board == item){ garbage = item } });
        if(garbage == undefined){
            throw new Error('This bulletin board does not exist');
        }

        let min = undefined;
        VerifiJson[board].auth.forEach(item => {
            if(item <= user.access.auth){ min = item }
        });

        if(min != undefined){
            return VerifiJson[board].verification[min];
        }else{
            throw new Error('You do not have access rights');
        }
    }

    const Verification = () => {
        const filter = VerifiAuth(data.board);

        // 유저 토큰 검증
        if(!LocalPayload || LocalPayload.status == 'fail'){
            throw new Error('Token error');
        }

        // 게시글 제목 검증
        if(typeof filter.title == 'object'){
            if(filter.title.command){
                if(!data.title || data.title == undefined || data.title == ''){
                    throw new Error('There is no title');
                }
                RequestData.title = SetHtml('title', filter.title.setting, data.title);
            }else{
                RequestData.title = data.title;
            }
        }

        // 게시글 내용 검증
        if(typeof filter.content == 'object'){
            if(filter.content.command){
                if(!data.content || data.content == undefined || data.content == ''){
                    throw new Error('There is no content');
                }
                RequestData.content = SetHtml('content', filter.content.setting, data.content);
            }else{
                RequestData.content = data.content;
            }
        }

        // 메타 검증
        if(typeof data.meta == 'object'){
            console.log(typeof filter.admissionMeta);
            // 승인된 메타 검증
            if(typeof filter.admissionMeta == 'object'){
                let garbage = 0;
                filter.admissionMeta.forEach(item => {
                    for (let object in data.meta) {
                        if(item == object){ garbage++ }
                    }
                });

                if(filter.admissionMeta.length != garbage){
                    throw new Error('The meta has broken out');
                }
            }

            // 카테고리 검증
            if(typeof filter.category == 'object'){
                if(!data.meta.category || data.meta.category == '' || data.meta.category == undefined){
                    throw new Error('This category does not exist');
                }
                let garbage = undefined;
                filter.category.forEach(item => {
                    if(item == data.meta.category){ garbage = true }
                });
                if(garbage == undefined){
                    throw new Error('This category does not exist');
                }
            }

            // 오픈세팅 검증
            if(typeof filter.openSetting == 'object'){
                if(!data.meta.openSetting || data.meta.openSetting == '' || data.meta.openSetting == undefined){
                    throw new Error('This openSetting does not exist');
                }
                let garbage = 0;
                filter.openSetting.forEach(item => {
                    for (let object in data.meta.openSetting) {
                        if(item == object){ garbage++ }
                    }
                });

                if(filter.openSetting.length != garbage){
                    throw new Error('The openSetting has broken out');
                }
            }
        }else{
            throw new Error('The meta object does not exist');
        }
    }

    const SetHtml = (position, index, text) => {
        let Setting = {};
        (AllowedTags[position][index].allowedTags) ? Setting.allowedTags = AllowedTags[position][index].allowedTags : undefined;
        (AllowedTags[position][index].allowedAttributes) ? Setting.allowedAttributes = AllowedTags[position][index].allowedAttributes : undefined;
        (AllowedTags[position][index].allowedStyles) ? Setting.allowedStyles = AllowedTags[position][index].allowedStyles : undefined;
        (AllowedTags[position][index].allowedIframeHostnames) ? Setting.allowedIframeHostnames = AllowedTags[position][index].allowedIframeHostnames : undefined;
        
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
            post : RequestData.content,
            meta : data.meta
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
