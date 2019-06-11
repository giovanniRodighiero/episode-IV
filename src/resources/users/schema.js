const baseUserSchema = {
    $id: 'baseUser',
    type: 'object',
    required: ['email', 'role'],
    properties: {
        _id: { type: 'string', description: 'Mongo id' },
        email: { type: 'string', format: 'email', description: 'Email address' },
        role: { type: 'number', description: 'Role of access' },
        accountConfirmed: { type: 'boolean', description: 'The account is confirmed by the user by clicking an email link' }
    },
    additionalProperties: false
};

module.exports = {
    baseUserSchema
};