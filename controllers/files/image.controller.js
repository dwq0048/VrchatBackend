const Schema = require('../../models/functions');
const Helper = require('../../models/helper/index');

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

    const payload = {
        index : req.params.id,
        query : req.query
    }
    
    const Path = `./public/uploads/images`;
    let ViewRequest = {};

    const LoadUrl = async (data) => {
        const ThisDay = Helper.NORMAL.formatDate(data.info.date);
        let array = [];
        if(payload.query.resize){
            array.push('X'+payload.query.resize);
        }
        array = (array.length != 0) ? '_fixed+'+array.join('+') : '_original';
        const Loader = `${Path}/${ThisDay}/fixed/${data.filename}${array}`;

        const r = fs.createReadStream(Loader);
        const ps = new stream.PassThrough();
        stream.pipeline(r, ps, (err) => {
            if (err) {
                onError(err);
            }
        });
    
        ps.pipe(res);
    }

    const ViewImage = async () => {
        await Schema.IMAGE.View(payload).then((req) => {
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

        console.log(url());

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
