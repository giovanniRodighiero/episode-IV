const { encrypt } = require('node-password-encrypter');

const { userRegistrationTemplate } = require('../../views/email');
const { errorTypes } = require('../../services/errors');



const registrationController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { email, password } = request.body;

    try {
        const user = await Users.findOne({ email });
        if (user) {
            reply.code(409);
            return { code: errorTypes.ALREADY_EXISTING };
        }

        const { salt, encryptedContent } = await encrypt({ content: password, keylen: 128, iterations: 1000 });
        await Users.insertOne({
            email,
            password: encryptedContent,
            salt,
            role: this.config.userRoles.USER,
            accountActive: false,
            privacyAccepted: true
        });

        this.jwt.sign({ account: email }, { expiresIn: '2 days' }, (err, token) => {
            if (err) {
                console.log(err)
                reply.code(500);
                reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
            }

            this.nodemailer.sendMail({
                from: this.config.mailer.from,
                to: email,
                subject: 'Successful registration',
                html: userRegistrationTemplate({
                    htmlTitle: 'Registration',
                    activationLink: this.config.address + '/api/v1/confirmation/' + token
                })
            }, (err, info) => {
                if (err) {
                    console.log(err)
                    reply.code(500);
                    reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
                }
    
                reply.code(201);
                reply.send({ code: 'success' });
            });
        }); 

        
    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.INTERNAL_SERVER_ERROR };
    }
};

const registrationSchema = {

    description: 'Used to create a new account for a user. After a successful registration, an email with the account activation link will be sent to the provided email address.',
    summary: 'Users registration',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['email', 'password', 'confirmPassword', 'privacyAccepted'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            confirmPassword: { const: { '$data': '1/password' } },
            privacyAccepted: { type: 'boolean', const: true, description: 'Explicit privacy consent' }
        },
        additionalProperties: false
    },

    response: {

        201: {
            type: 'object',
            required: ['code'],
            description: 'Successful response',
            properties: {
                code: { type: 'string' }
            }
        },

        400: 'baseError#',

        409: 'baseError#'
    }

};

module.exports = {
    registrationController,
    registrationSchema
};