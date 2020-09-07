var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');

var app = express();
app.io = require('socket.io')();

var config = require('./config/index');
var authRouter = require('./routes/api/auth');
var boardRouter = require('./routes/api/board');
var imageRouter = require('./routes/files');

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = [];
const ports = 8080;
const protocal = 'http';

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          results.push(protocal + '://' + net.address + ':' + ports);
        }
    }
}
results.push(protocal + '://' + '127.0.0.1' + ':' + ports);

console.log(results);

app.use(cors({
  origin: results,
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/1/auth', authRouter);
app.use('/api/1/board', boardRouter);
app.use('/images/', imageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// JWT secret
app.set('jwt-secret', config.JWT.secret);
app.set('jwt-re-secret', config.JWT.ReSecret);

// DB
mongoose.Promise = global.Promise;
mongoose.connect(config.DB.address, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

// Socket IO
app.io.on('connection', function(socket){
  const Schema = {
    POST : require('./models/schema/post/post.js')
  };
    
  Schema.POST.find().then((req) => {
    for(let i=0; i<req.length; i++){
      socket.on(req[i]._id, function(payload){
        app.io.emit(req[i]._id, payload);
      });
    }
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
