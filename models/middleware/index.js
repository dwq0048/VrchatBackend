
const cors = require('cors');
const { networkInterfaces } = require('os');

const mongoose = require('mongoose');
const Schema = require('../../models/functions/index.js');
const config = require('../../config/index');

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
          `${config.DB.type}://${config.DB.address}:${config.DB.port}/${config.DB.collection}`,

          { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
        ).then(() => {
            console.log('Successfully connected to mongodb')
        }).catch((e) => {
            console.error(e)
        });
    },
    _socket : (app) => {
        app.io = require('socket.io')();

        app.io.on('connection', function(socket){
            Schema.POST.Read.Find().then((req) => {
                for(let i=0; i<req.length; i++){
                    socket.on(req[i]._id, function(payload){
                        Schema.COMMENT.Read.Find(payload.payload.data.result).then((item) => {
                            if(typeof item[0] == 'object'){
                                app.io.emit(req[i]._id, item[0]);
                            }
                        });
                    });
                }
            })
        });
    },
    _jwt : (app) => {
        app.set('jwt-secret', config.JWT.secret);
        app.set('jwt-re-secret', config.JWT.ReSecret);
    }
};

const Middleware = {
    app : (object) => {
        functions.network();
        functions._cors(object.app);
        functions._mongoose();
        functions._socket(object.app);
        functions._jwt(object.app);

        console.log(data.results);
    }
};

module.exports = Middleware;
