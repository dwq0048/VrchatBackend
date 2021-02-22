const fs = require('fs');

const NORMAL = {
    formatDate : ( date ) => {
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
    
        if (month.length < 2){ month = '0' + month };
        if (day.length < 2){ day = '0' + day };
    
        return [year, month].join('');
    },
    mkdir : ( dirPath ) => {
        const isExists = fs.existsSync( dirPath );
        if( !isExists ) { fs.mkdirSync( dirPath, { recursive: true } ) };
    }
}

module.exports = { NORMAL }
