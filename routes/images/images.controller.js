const express = require('express');
const fs = require('fs');
const stream = require('stream');

const image = (req, res, next) => {
    const r = fs.createReadStream('./public/uploads/board/notice/'+req.params.id);
    const ps = new stream.PassThrough();
    stream.pipeline(r, ps, (err) => {
        console.log(r);
        console.log(ps);
        if (err) {
            console.log(err);
            return res.sendStatus(400); 
        }
    });

    ps.pipe(res);
}

module.exports = image;
