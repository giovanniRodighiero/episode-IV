const availableErrorCodes = [
    'not_found', 'wrong_password'
];

const baseErrorSchema = {
    $id: 'baseError',
    type: 'object',
    properties: {
        code: { type: 'string', enum: availableErrorCodes }
    }
}

module.exports = {
    baseErrorSchema
}