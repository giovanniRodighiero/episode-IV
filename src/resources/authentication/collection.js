const crypto = require('crypto');
const uuid = require('uuid');

function newStatefulToken () {
    const plainToken = uuid.v4();
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    
    return { plainToken, hashedToken };
};

function hashToken (token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};


module.exports = {
    AUTH: { newStatefulToken, hashToken }
};