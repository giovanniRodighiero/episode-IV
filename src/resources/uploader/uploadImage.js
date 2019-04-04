const path = require('path');
const pump = require('pump');
const fs = require('fs');
const sharp = require('sharp');



const handler = ({ reply, config }) => (field, file, filename, encoding, mimetype) => {

    const fileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const absolutePath = path.join(__dirname, `../../../public/images/uploads/${fileName}`);
    
    const publicUrl = `${config.address}/public/images/uploads/${fileName}.webp`;

    pump(file, fs.createWriteStream(absolutePath), _ => {
        sharp(absolutePath)
            .webp({ lossless: true })
            .toFile(`${absolutePath}.webp`)
            .then(result => {
                fs.unlink(absolutePath, (error => {
                    if (error) throw error;
                    reply.code(200);
                    reply.send({ url: publicUrl });
                }));
            })
            .catch(error => { throw error; })
    });

    // be careful of permission issues on disk and not overwrite
    // sensitive files that could cause security risks
}

const uploadImageController = function (request, reply) {
    const mp = request.multipart(handler({ reply, config: this.config }), function (err) {
        if (err)
            reply.code(500).send(err);
    });

};

const uploadImageSchema = {
    summary: 'Upload an image file.',
    description: 'Given a input file in form data, it uploads the file and return the url with the path of the image.',
    tags: ['Uploader'],
    consumes: [ 'multipart/form-data' ],

    // body: {
    //     type: 'object',
    //     required: ['file'],
    //     properties: {
    //         file: { type: 'string' }
    //     }
    // },

    response: {
        200: {
            type: 'object',
            required: ['url'],
            properties: {
                url: { type: 'string', description: 'Image url' }
            }
        }
    }
}

module.exports = {
    uploadImageController,
    uploadImageSchema
};