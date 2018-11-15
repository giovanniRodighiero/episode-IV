const { errorTypes } = require('../errors/schema');
const { userRegistrationTemplate } = require('../../views/email');


const creationController = async function (request, reply) {
    const Users = this.mongo.db.collection('users');
    const { email, role } = request.body;

    // CHECK FOR TOO HIGH ROLE
    if (role >= request.user.role) {
        reply.code(400);
        return { code: errorTypes.VALIDATION_ERROR };
    }

    try {
        // CHECK FOR ALREADY EXISTING EMAIL
        const user = await Users.findOne({ email }, { email: 1 });
        if (user) {
            reply.code(409);
            return { code: errorTypes.ALREADY_EXISTING };
        }

        // ALL FINE SAVE + EMAIL
        await Users.insertOne({ email, role, accountConfirmed: false, privacyAccepted: false });
        this.jwt.sign({ account: email }, { expiresIn: '2 days' }, (err, token) => {
            if (err) {
                console.log(err)
                reply.code(500);
                reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
            }

            this.nodemailer.sendMail({
                from: this.config.mailer.from,
                to: email,
                subject: 'Account confirmation',
                html: userRegistrationTemplate({
                    htmlTitle: 'Account confirmation',
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

const creationSchema = {
    summary: 'Creates a non-confirmed user account',
    description: 'Creates a new user account with a role lower than the user who created it. A confirmation email will be sent to the provided address.',
    tags: ['Users'],

    body: {
        type: 'object',
        required: ['email', 'role'],
        properties: {
            email: { type: 'string', format: 'email', description: 'A confirmation email will be sent here.' },
            role: { type: 'number', minimum: 70, default: 70, description: 'User role' }
        },
        additionalProperties: false
    },

    response: {
        400: 'baseError#',

        401: 'baseError#',

        403: 'baseError#',
    }
};

module.exports = {
    creationController,
    creationSchema
};