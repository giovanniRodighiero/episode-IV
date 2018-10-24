const { userRegistrationTemplate } = require('../../views/email');
const { errorTypes } = require('../../services/errors');


const resendRegistrationEmailController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { email } = request.body;

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            reply.code(404);
            return { code: errorTypes.NOT_FOUND };
        }

        if (user.accountActive) {
            reply.code(403);
            return { code: errorTypes.ALREADY_ACTIVE };
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

const resendRegistrationEmailSchema = {
    summary: 'Resend the account confirmation email',
    description: 'Resend the account confirmation email for a specified email address. It only works for a non-active account.',
    tags: ['Authentication'],

    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' }
        },
        description: 'Email of the account to send the confirmation email.'
    },

    response: {

        200: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string' }
            }
        },

        400: 'baseError#',

        403: 'baseError#',

        404: 'baseError#'

    }
};

module.exports = {
    resendRegistrationEmailController,
    resendRegistrationEmailSchema
};