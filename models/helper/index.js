const fs = require('fs');

module.exports = {
    '' : () => { console.log(undefined) },
    formatDate : ( option ) => {
        const date = new Date(option);
        let variable = {
            month : date.getMonth() + 1,
            day : date.getDate(),
            year : date.getFullYear()
        };
    
        if (variable.month.length < 2){ variable.month = '0' + variable.month };
        if (variable.day.length < 2){ variable.day = '0' + day };
    
        const result = [variable.year, variable.month].join('');
        console.log(result);
        return result;
    },
    mkdir : ( dirPath ) => {
        const isExists = fs.existsSync( dirPath );
        if( !isExists ) { fs.mkdirSync( dirPath, { recursive: true } ) };
    }
}
