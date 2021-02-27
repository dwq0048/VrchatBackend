const Config = require('../../config/index.js');
const multer = require('multer');

module.exports = (object) => {
    let options = {
        type : false,
        name : false,
        file : {},
    };

    if(typeof object == 'object'){
        if(typeof object.path == 'string'){
            Config.UPLOAD.type.map((item) => { (item == object.path) ? options.type = object.path : undefined });
            (!options.type) ? options.type = 'post' : undefined;
        };
        if(typeof object.name == 'string'){
            options.name = object.name;
        }
    };

    let upload = false;
    if(options.type){
        upload = multer({
            storage : multer.diskStorage({
                destination: async function (req, file, cb) {
                    cb(null, `${Config.UPLOAD.path}/${options.type}/temp`);
                }
            })
        });
    }
    (!upload) ? upload = multer() : undefined;

    if(typeof object.file == 'object'){
        if(typeof object.file.type == 'string'){
            if(object.file.type == 'array'){
                options.file.type = 'array'
            }else if(object.file.type == 'single'){
                options.file.type = 'single'
            }else{
                options.file.type = 'array'
            }

            if(typeof object.file.max == 'string' || typeof object.file.max == 'number'){
                options.file.max = object.file.max;
            }else{
                options.file.max = false;
            }
        }
    }

    if(options.name){
        if(typeof options.file == 'object'){
            if(typeof options.file.type == 'string'){
                if(options.file.type == 'array'){
                    if(options.file.max){
                        return upload.array(options.name, options.file.max);
                    }else{
                        return upload.array(options.name);
                    }
                }else if(options.file.type == 'single'){
                    return upload.single(options.name);
                }
            }else {
                return upload.array(options.name);
            }
        }else{ return upload }
    }else{ return upload }
}

//multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
