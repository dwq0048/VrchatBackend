const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const app = express();
//app.io =  require('socket.io')();

const middleware = require('./models/middleware/index.js');
middleware.app({ app : app });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/auth/', require('./routes/api/v1/auth.js'));
app.use('/api/v1/board/', require('./routes/api/v1/board.js'));

//app.use((req, res, next) => { next(createError(404)) });
//app.use((err, req, res, next) => { res.status(404).json({ message: err.message }) });

module.exports = app;
