const Schema = {
    POST : require('../../../models/schema/post/post'),
    IMAGE : require('../../../models/schema/file/image')
}

const { promisify } = require('util');
const sharp = require("sharp");
const sizeOf = promisify(require('image-size'));
const sanitizeHtml = require('sanitize-html');

const config = require('../../../config/index.js');
const options = {};
options.image = config.image;

const formatDate = (date) => {
	let d = new Date(date);
	let month = '' + (d.getMonth() + 1);
	let day = '' + d.getDate();
	let year = d.getFullYear();

	if (month.length < 2){ month = '0' + month };
	if (day.length < 2){ day = '0' + day };

	return [year, month].join('');
}

const Today = formatDate(Date.now());

const post = (req, res, next) => {
    const images = [];
    const files = [];
    const array = [];

    // Response Setting Start
    const onResponse = (result) => {
        res.status(200).json({ state : 'success', result });
    }

    const onError = (e) => {
        console.log(e);
        res.status(401).json({ state : 'error', e });
    }
    // Response Setting End

    // Token Verification Start
    const LocalPayload = res.locals.payload;
    
    if(!LocalPayload || LocalPayload.status == 'fail'){
        onError('Token error');

        return;
    }
    // Token Verification End
    
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

    if(data.meta != undefined){
        data.meta = JSON.parse(data.meta);
    }

    for(let i=0;i<req.files.length;i++){
        if(req.files[i].fieldname == 'images'){
            req.files[i].meta = {};
            images.push(req.files[i]);
        }
    }

    const imageMeta = async () => {
        for(let i=0;i<images.length;i++){
            const position = await sizeOf(images[i].path);

            await defaultSharp(i);
            await imageSharp(i);

            if(data.meta != undefined){
                images[i].meta.width = position.width;
                images[i].meta.height = position.height;
                images[i].meta.isCrop = data.meta.imgMeta[i].isCrop;
                images[i].meta.crop =  data.meta.imgMeta[i].crop;
                images[i].meta.fixed = [ 'default' ];   
            }

            images[i].info = {
                ip : req.ip || req.headers.host,
                userAgent : req.headers["user-agent"] || req.get('User-Agent'),
                postPath : 'board/'+data.position,
            }

            images[i].user = {
                index : user.index,
                userid : user.userid
            }
            
            if(data.meta != undefined){
                if(data.meta.imgMeta[i].isCrop == true){
                    images[i].meta.fixed.push('crop');
                }   
            }
        }
    }

    const defaultSharp = (index) => {
        const File = images;
        sharp(File[index].path).metadata().then(info => {
            const width = Math.round(info.width);
            const height = Math.round(info.height);

            const filePath = options.image.path.imgPath +'/'+ Today +'/'+ 'fixed' +'/'+ File[index].filename +'+default';
            return sharp(File[index].path).resize({width: width, height: height}).toFile( filePath );
        });
    }

    const imageSharp = (index) => {
        const File = images;
        for(let i=0;i<options.image.option.length;i++){
            sharp(File[index].path).metadata().then(info => {
                if(options.image.option[i].name == 'resize'){
                    if(info.width >= options.image.option[i].meta.width){
                        const filePath = options.image.path.imgPath +'/'+ Today +'/'+ 'fixed' +'/'+ File[index].filename +'+x'+ options.image.option[i].meta.width;
                        return sharp(File[index].path).resize({ width: options.image.option[i].meta.width }).toFile( filePath );
                    }
                }else if(options.image.option[i].name == 'thumbnail'){
                    if(index == data.meta.thumbnail.num){
                        const filePath = options.image.path.imgPath +'/'+ Today +'/'+ 'fixed' +'/'+ File[index].filename +'+'+ 'thumb' +'+x'+ options.image.option[i].meta.width;
                        sharp(File[index].path).resize(
                            {
                                width: options.image.option[i].meta.width,
                                height: options.image.option[i].meta.height,
                                position:"center"
                            }
                        ).toFile( filePath );
                    }
                }
            })
        }
    }

    const InsertImage = () => {
        return new Promise((resolve, reject) => {
            Schema.IMAGE.insertMany(images).then((req) => {
                for(let i=0;i<req.length;i++){ array.push(req[i]._id) };
                resolve('success');
            }).catch((e) => {
                reject(e);
            })
        })
    }

    const InsertPost = () => {
        const object = {
            title : data.title,
            board : data.position,
            user : user.index,
            type : {
                state : 2,
                password : '',
                skin : ''
            },
            post : data.post,
            images: array
        }

        if(data.meta != undefined){
            object.meta = {
                thumbnail : {
                    num : data.meta.thumbnail.num
                }
            }
        }else {
            object.meta = {}
        }

        Schema.POST.create(object).then((req) => {
            onResponse({ id : req._id });
        }).catch((e) => {
            onError(e.message);
        })
    }

    const RunCommand = async () => {
        try{
            await imageMeta();
            await InsertImage();

            InsertPost();    
        } catch (err){
            console.log(err);
        }
    }
    RunCommand();

}

/*
    {} = 없을경우 인기 + 또는 최신 글 랜덤으로

    추천 알고리즘
        전체 : 50 = list 1
            인기 : 10
            최신 : 10
            테그(?)
            팔로우 최신 : 10 - {}
            뷰 한거 : 5 - {}
            좋아요 한거 : 5 - {}
            뷰 작성자 최신 : 5 - {}
            좋아요 작성자 최신 : 5 - {}

    list 1 - 이미지 까지 로드
    list 2 - 이미지 제외 로드
        list 1 의 3/5 스크롤 하면 list 2의 이미지 로드
        list 2 이미지를 로드하면 list 3의 이미지 제외 로드

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
*/

module.exports = post;
