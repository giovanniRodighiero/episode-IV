const sanitizeHtml = require('sanitize-html');
// https://www.npmjs.com/package/sanitize-html

const sanitizeSettings = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
        'a': ['href']
    },
    allowedIframeHostnames: []
}

const sanitizer = (fieldList = []) => function (request, reply, next) {

    fieldList.forEach(field => {
        if (!!request.body[field])
            request.body[field] = sanitizeHtml(request.body[field], sanitizeSettings); 
    });

    next();

};

module.exports = sanitizer;