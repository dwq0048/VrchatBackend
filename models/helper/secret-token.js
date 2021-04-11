const password = 'luochi'
const secret = {
    encryption : (token) => {
        const crypto = require('crypto');
        const cipher = crypto.createCipher('aes-256-cbc', 'luochi');
        
        let result = JSON.stringify(token);
        result = cipher.update(result, 'utf8', 'base64');
        result += cipher.final('base64');

        return result;
    },
    decorative : (token) => {
        try{
            const crypto = require('crypto');
            const decipher = crypto.createDecipher('aes-256-cbc', 'luochi');
            let data = decipher.update(token, 'base64', 'utf8');
            data += decipher.final('utf8');
            data = JSON.parse(data);
            
            return data;
        }catch(e){
            return false;
        }
    },
    AccessTime : '10m',
    RefreshTime : '30m'
}

module.exports = secret;
