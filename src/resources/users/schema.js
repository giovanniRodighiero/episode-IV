const baseUserSchema = {
    $id: 'baseUser',
    type: 'object',
    required: ['email', 'role'],
    properties: {
        _id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'number' },
        accountConfirmed: { type: 'boolean' }
    },
    additionalProperties: false
};

module.exports = {
    baseUserSchema
};