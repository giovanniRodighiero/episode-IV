// MIDDLEWARES
const secureAuth = require('../../middlewares/authentication');
const secureConfirmedAccount = require('../../middlewares/confirmedAccount');

const { uploadImageController, uploadImageSchema } = require('./uploadImage');

const initUploader = fastify => {

    fastify.post('/api/v1/uploader', {
        preValidation: [ secureAuth, secureConfirmedAccount ],
        schema: uploadImageSchema
    }, uploadImageController);

};

module.exports = initUploader;