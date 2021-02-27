
const cors = require('cors');
const { networkInterfaces } = require('os');

const mongoose = require('mongoose');
const Schema = require('../../models/functions/index.js');
const Helper = require('../../models/helper/index');
const Config = require('../../config/index');

let data = { results : [] };

const functions = {
    network : () => {
        const nets = networkInterfaces();
        const ports = 8080;
        const protocal = 'http';
        
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    data.results.push(protocal + '://' + net.address + ':' + ports);
                }
            }
        }

        data.results.push(protocal + '://' + '127.0.0.1' + ':' + ports);
    },
    _cors : (app) => {
        app.use(cors({
            origin: data.results,
            credentials: true
        }));
    },
    _mongoose : () => {
        mongoose.Promise = global.Promise;

        mongoose.connect(
          `${Config.DB.type}://${Config.DB.address}:${Config.DB.port}/${Config.DB.collection}`,

          { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
        ).then().catch((e) => { console.error(e) });
    },
    _socket : (app) => {
        app.io = require('socket.io')();

        app.io.on('connection', function(socket){
            Schema.POST.Read.Find().then((req) => {
                for(let i=0; i<req.length; i++){
                    try {
                        socket.on(req[i]._id, function(payload){
                            Schema.COMMENT.Read.Find(payload.payload.data.result).then((item) => {
                                if(typeof item[0] == 'object'){
                                    app.io.emit(req[i]._id, item[0]);
                                }
                            }).catch((e) => { console.log(e) });
                        });
                    }catch(error){
                        console.log(error);
                    }
                }
            }).catch((e) => { console.log(e); })
        });
    },
    _jwt : (app) => {
        app.set('jwt-secret', Config.JWT.secret);
        app.set('jwt-re-secret', Config.JWT.ReSecret);
    },
    _mkdir : async () => {
        const Today = Helper.formatDate(Date.now());
        // Uploads folder for Post
        await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.post.upload}`);
        await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.post.upload}/temp`);
            // if you upload express disk
            await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.post.upload}/${Today}`);
            await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.post.upload}/${Today}/fixed`);
            await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.post.upload}/${Today}/original`);

        // Uploads folder for Profile
        await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.profile.upload}`);
        await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.profile.upload}/temp`);
            // if you upload express disk
            await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.profile.upload}/${Today}`);
            await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.profile.upload}/${Today}/fixed`);
            await Helper.mkdir(`${Config.UPLOAD.path}/${Config.UPLOAD.option.profile.upload}/${Today}/original`);
    }
};

const Middleware = {
    app : async (object) => {
        functions.network();
        functions._cors(object.app);
        functions._mongoose();
        functions._socket(object.app);
        functions._jwt(object.app);
        functions._mkdir();
    }
};

module.exports = Middleware;
