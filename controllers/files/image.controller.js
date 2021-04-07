const Schema = require('../../models/functions');
const Helper = require('../../models/helper/index');
const Config = require('../../config/index.js');

const fs = require('fs');
const stream = require('stream');

const image = (req, res, next) => {
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

    const payload = { index : req.params.id, query : req.query }
    let ViewRequest = {};
    let Path = false;

    const LoadUrl = async (data) => {
        const ThisDay = Helper.formatDate(data.info.date);
        let array = [];
        let Garbage = 0;
        if(payload.query.resize){
            if(typeof data.meta == 'object'){
                if(typeof data.meta.options == 'object'){
                    if(typeof data.meta.resize == 'array'){
                        data.options.resize.map(item => {
                            if(item >= payload.query.resize){ Garbage = item; return; }
                        });
                    }
                }
            }

            if(Garbage != 0){
                array.push('X'+payload.query.resize);
            }
        }

        if(typeof data.info.path == 'string'){
            Config.UPLOAD.type.map(item => {
                (item == data.info.path) ? Path = data.info.path : undefined;
            })
        }

        if(Path){
            Path = Config.UPLOAD.path + '/' + Path;
        }else{
            throw new Error({ message : 'There is no path in the DB' });
        }

        // 이미지 수정본 있을경우
        array = (array.length != 0) ? '_fixed+'+array.join('+') : '_resize';
        const Loader = `${Path}/${ThisDay}/fixed/${data.filename}${array}`;

        const r = fs.createReadStream(Loader);
        const ps = new stream.PassThrough();
        stream.pipeline(r, ps, (err) => { (err) ? onError(err) : undefined });
    
        ps.pipe(res);
    }

    const ViewImage = async () => {
        await Schema.IMAGE.Read.View(payload).then((req) => {
            ViewRequest = { status : true, payload : req };
        }).catch((error) => {
            throw new Error(error.message);
        });

        return ViewRequest;
    }

    const RunCommand = async () => {
        try{
            const ResultView = await ViewImage();
            LoadUrl(ResultView.payload);
        } catch (error){
            console.log(error);
            onError(error.message);
        }
    }
    RunCommand();

}

const image_temp = (req, res, next) => {
    const payload = {
        index : req.params.id
    }

    payload.option = (req.params.option) ? req.params.option : undefined;
    payload.width = (req.params.width) ? req.params.width : undefined;

    const formatDate = (date) => {
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
    
        if (month.length < 2){ month = '0' + month };
        if (day.length < 2){ day = '0' + day };
    
        return [year, month].join('');
    }

    Schema.IMAGE.findOne({ _id : payload.index }).then((req) => {
        const Today = formatDate(req.info.date);
        
        const url = () => {
            if (payload.option == 'thumbnail'){
                if(payload.width){
                    return `./public/uploads/images/${Today}/fixed/${req.filename}+thumb+x${payload.width}`
                }else {
                    return `./public/uploads/images/${Today}/fixed/${req.filename}+thumb+x150`
                }
            } else if(payload.option == 'original'){
                return `./public/uploads/images/${Today}/original/${req.filename}`
            }else {
                if(payload.width){
                    return `./public/uploads/images/${Today}/fixed/${req.filename}+x${payload.width}`
                }else{
                    return `./public/uploads/images/${Today}/fixed/${req.filename}+default`
                }
            }
        }

        const r = fs.createReadStream(url());
        const ps = new stream.PassThrough();
        stream.pipeline(r, ps, (err) => {
            if (err) {
                onError(err);
            }
        });
    
        ps.pipe(res);
    }).catch((err) => {
        onError(err);
    })

    const onError = (err) => {
        res.status(200).json({
            state : 'fail',
            message: err.message
        });
    }
}

module.exports = image;
