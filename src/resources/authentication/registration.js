const { encrypt } = require('node-password-encrypter');
const { promisify } = require('util');

const { userRegistrationTemplate } = require('../../views/email');
const { errorTypes, generateErrorSchema } = require('../errors/schema');
const { USERS } = require('../users/collection');

let signJwt;

const registrationController = async function (request, reply) {
    const Users = this.mongo.db.collection(USERS.collectionName);

    const { email, password } = request.body;

    // FETCH THE USER
    const user = await Users.findOne({ email });
    if (user) {
        reply.code(409);
        return { code: errorTypes.ALREADY_EXISTING };
    }

    // SAVE THE USER WITH ENCRYPTED PASSWORD
    const { salt, encryptedContent } = await encrypt({ content: password, keylen: 128, iterations: 1000 });
    await Users.insertOne({
        email,
        password: encryptedContent,
        salt,
        role: this.config.userRoles.USER,
        accountConfirmed: false,
        privacyAccepted: true
    });

    if (!signJwt)
        signJwt = promisify(this.jwt.sign);

    // CREATE A NEW TOKEN TO ALLOW LOGIN SKIP
    const token = await this.jwt.sign({ account: email }, { expiresIn: '2 days' });
    
    // SEND CONFIRMATION ACCOUNT EMAIL
    await this.nodemailer.sendMail({
        from: this.config.mailer.from,
        to: email,
        subject: 'Successful registration',
        html: userRegistrationTemplate({
            htmlTitle: 'Registration',
            activationLink: `${this.config.address}/api/v1/confirmation/${token}` 
        })
    });

    reply.code(201);
    return { code: 'success' };
};

const registrationSchema = {

    description: 'Used to create a new account for a user. After a successful registration, an email with the account activation link will be sent to the provided email address.',
    summary: 'Users registration',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['email', 'password', 'confirmPassword', 'privacyAccepted'],
        properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', transform: ['trim'], description: 'User password' },
            confirmPassword: { const: { '$data': '1/password' }, description: 'Confirm user password' },
            privacyAccepted: { type: 'boolean', const: true, description: 'Explicit privacy consent' }
        },
        additionalProperties: false
    },

    response: {

        201: {
            type: 'object',
            required: ['code'],
            description: 'Registration completed successfully',
            properties: {
                code: { type: 'string' }
            }
        },

        400: generateErrorSchema([errorTypes.MISSING_PARAM, errorTypes.VALIDATION_ERROR], 'Validation error'),

        409: generateErrorSchema(errorTypes.ALREADY_EXISTING, 'Email address already in use')
    }

};

module.exports = {
    registrationController,
    registrationSchema
};