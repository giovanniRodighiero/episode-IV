const baseUserSchema = {
    $id: 'baseUser',
    type: 'object',
    required: ['email', 'role'],
    properties: {
        email: { type: 'string', format: 'email' },
        role: { type: 'number' }
    }
};

module.exports = {
    baseUserSchema
};