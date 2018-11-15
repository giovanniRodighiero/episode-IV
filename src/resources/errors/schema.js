const errorTypes = {
    // generic errors
    INTERNAL_SERVER_ERROR: 'internal_server_error', // 500 generic error
    VALIDATION_ERROR: 'validation_error', // body validation failed
    MISSING_PARAM: 'missing_param', // body param missing
    NOT_FOUND: 'not_found', // something not found in database
    NOT_AUTHORIZED: 'not_authorized', // account not authorized to do something
    NOT_AUTHENTICATED: 'not_authenticated', // account not authenticated

    // specific errors
    WRONG_PASSWORD: 'wrong_password', // wrong password on login
    PASSWORD_MISMATCH: 'password_mismatch', // different password on registration
    ALREADY_EXISTING: 'already_existing', // record already existing for the privided info (cfr registration)
    ALREADY_ACTIVE: 'already_active', // account already active (cfr  account confirmation)
    NOT_CONFIRMED: 'not_confirmed'
};

const availableErrorCodes = [];
for (const error in errorTypes) { availableErrorCodes.push(errorTypes[error]); }

const baseErrorSchema = {
    $id: 'baseError',
    type: 'object',
    required: ['code'],
    properties: {
        code: { type: 'string', enum: availableErrorCodes, description: 'Error code' },
        fieldName: { type: 'string', description: 'Which field is affected by the error code, like for "required"' }
    },
    additionalProperties: false
}

module.exports = {
    baseErrorSchema,
    errorTypes
}