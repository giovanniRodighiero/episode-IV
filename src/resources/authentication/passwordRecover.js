const { userRegistrationTemplate } = require('../../views/email');
const { errorTypes } = require('../errors/schema');

const passwordRecoverController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { email } = request.body;

    try {
        const user = await Users.findOne({ email });
        // USER NOT FOUND
        if (!user) {
            reply.code(404);
            return { code: errorTypes.NOT_FOUND };
        }

        // USER ACCOUNT NOT CONFIRMED
        if (!user.accountConfirmed) {
            reply.code(403);
            return { code: errorTypes.NOT_AUTHORIZED };
        }

        this.jwt.sign({ account: email }, { expiresIn: '2 days' }, (err, token) => {
            if (err) {
                console.log(err)
                reply.code(500);
                reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
            }

            this.nodemailer.sendMail({
                from: this.config.mailer.from,
                to: email,
                subject: 'Password recovery',
                html: userRegistrationTemplate({
                    htmlTitle: 'Password Recovery',
                    activationLink: this.config.address + '/api/v1/recovery/' + token
                })
            }, (err, info) => {
                if (err) {
                    console.log(err)
                    reply.code(500);
                    reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
                }
    
                reply.code(200);
                reply.send({ code: 'success' });
            });
        }); 

    } catch (error) {
        console.log(error);
        reply.code(500);
        return { code: errorTypes.INTERNAL_SERVER_ERROR };
    }
};

const passwordRecoverSchema = {
    summary: 'Send an email with the password recovery link',
    description: 'Send an email with the password recovery link for a confirmed user account.',
    tags: ['Authorization'],

    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email', transform: ['trim', 'toLowerCase'] }
        },
        additionalProperties: false,
        description: 'Email of the account to send the recover password email.'
    },

    response: {
        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            }
        },

        404: 'baseError#'
    }
};

module.exports = {
    passwordRecoverController,
    passwordRecoverSchema
};