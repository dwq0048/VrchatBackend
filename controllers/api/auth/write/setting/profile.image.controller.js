const Schema = require('../../../../../models/functions');
const Helper = require('../../../../../models/helper/index');
const Config = require('../../../../../config/index.js');

const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const sharp = require("sharp");

const Loader = async (user, index, files, meta) => {
    let images = [];
    let Request = {};
    const Today = Helper.formatDate(Date.now());
    const filePath = `${Config.UPLOAD.path}/${Config.UPLOAD.option.profile.upload}/${Today}`;

    // if you upload express disk
    await Helper.mkdir(`${filePath}`);
    await Helper.mkdir(`${filePath}/fixed`);
    await Helper.mkdir(`${filePath}/original`);

    for(let i=0;i<files.length;i++){
        if(files[i].fieldname == 'thumbnail'){ images.push(files[i]) };
    };

    (!index || index == undefined || files.length == 0) ? undefined :  images = [ images[index] ];

    const GetImages = async () => {
        for (let i=0;i<images.length;i++){
            const info = await sizeOf(images[i].path);

            images[i].meta = { width : info.width, height : info.height, options : {} };
            images[i].user = user.index;
            images[i].info = { path : 'profile' };
            
            if(typeof meta.images == 'object'){            
                if(typeof meta.images[i] == 'object'){
                    if(typeof meta.images[i].index == 'string'){
                        images[i].meta.index = meta.images[i].index;
                    }
                }
            }
        }
    };

    const SharpImage = async () => {
        for (let i=0;i<images.length;i++){
            await Original(i);
            await Resize(i);
        }
    };

    const Original = async (index) => {
        // Temp의 이미지를 ./{Today}/original/ 로 이동
        await sharp(images[index].path).metadata().then(() => {
            const ReFile = filePath + `/original/${images[index].filename}`;
            return sharp(images[index].path).toFile( ReFile );
        });
        
        // Default 편집 이미지를 Fixed의 _resize 로 저장
        sharp(images[index].path).metadata().then(info => {
            const width = Math.round(info.width);
            const height = Math.round(info.height);

            const ReFile = filePath + `/fixed/${images[index].filename}_resize`;
            return sharp(images[index].path).resize({width: width, height: height}).toFile( ReFile );
        });
    }
    
    const Resize = async (index) => {
        // Config 의 resize 이미지
        images[index].meta.options.resize = [];
        const Size = Config.UPLOAD.option.profile.resize.size;
        for(let i=0; i<Size.length; i++){
            await sharp(images[index].path).metadata().then(info => {
                if(info.width >= Size[i]){
                    try {
                        images[index].meta.options.resize.push(Size[i]);
                        const ReFile = filePath + `${images[index].filename}_fixed+X${Size[i]}`;
                        return sharp(images[index].path).resize({ width: Size[i] }).toFile( ReFile );
                    }catch(error){
                        throw new Error(error.message)
                    }
                }
            })
        }
    }

    const InsertImage = async () => {
        String.prototype.replaceAll = function(org, dest) { return this.split(org).join(dest) };
        images.map(item => {
            (typeof item.destination == 'string') ? item.destination = filePath : undefined;
            (typeof item.path == 'string') ? item.path = (`${filePath}/original/${item.filename}`).replaceAll("/","\\").replace(/^\.\\/, "") : undefined;
        });

        await Schema.IMAGE.Write.InsertToo(images).then((req) => {
            try {
                Request.list = [];
                Request.status = true;
                for(let i=0;i<req.length;i++){ Request.list.push(req[i]._id) };
            } catch (error){
                throw new Error(error.message);
            }
        }).catch((error) => {
            throw new Error(error.message);
        })
        
        return Request;
    }

    const RunCommand = async () => {
        try {
            await GetImages();
            await SharpImage();

            return InsertImage();
        } catch (error){
            return {
                status : false,
                message : error.message
            }
        }
    };
    return RunCommand();
}

module.exports = Loader;
