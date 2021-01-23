const Schema = require('../../../../models/functions');
const Helper = require('../../../../models/helper/index');

const config = require('../../../../config/index.js');
const options = { image : config.image };

const { promisify } = require('util');
const sharp = require("sharp");
const sizeOf = promisify(require('image-size'));

const loader = async (user, index, files, meta) => {
    let images = [];
    const filePath = `${options.image.path.imgPath}/${Helper.NORMAL.formatDate(Date.now())}/fixed/`;

    let Request = {};

    for(let i=0;i<files.length;i++){
        if(files[i].fieldname == 'images'){
            images.push(files[i]);
        }
    }

    const GetImage = async () => {
        for (let i=0;i<images.length;i++){
            const info = await sizeOf(images[i].path);

            images[i].meta = { width : info.width, height : info.height, options : {} };
            images[i].user = user.index;
            images[i].info = {};
            
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
    }

    const Original = async (index) => {
        sharp(images[index].path).metadata().then(info => {
            const width = Math.round(info.width);
            const height = Math.round(info.height);

            const ReFile = filePath + `${images[index].filename}_original`;
            return sharp(images[index].path).resize({width: width, height: height}).toFile( ReFile );
        });
    }

    const Resize = async (index) => {
        images[index].meta.options.resize = [];
        const Size = options.image.option.resize.size;
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
        try{
            await GetImage();
            await SharpImage();
            
            return InsertImage();
        } catch (error){
            console.log(error);
            return {
                status : false,
                message : error.message
            }
        }
    }
    return RunCommand();
}

module.exports = loader;