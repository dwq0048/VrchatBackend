const Schema = {
    IMAGE: require('../../models/schema/file/image')
}

const fs = require('fs');
const stream = require('stream');

const image = (req, res, next) => {
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
