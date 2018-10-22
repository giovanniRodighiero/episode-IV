const errorTypes = {
    // generic errors
    INTERNAL_SERVER_ERROR: 'internal_server_error',
    VALIDATION_ERROR: 'validation_error',
    MISSING_PARAM: 'missing_param',
    NOT_FOUND: 'not_found',

    // specific errors
    WRONG_PASSWORD: 'wrong_password',
    PASSWORD_MISMATCH: 'password_mismatch',
    ALREADY_EXISTING: 'already_existing'
};

const availableErrorCodes = [];
for (const error in errorTypes) { availableErrorCodes.push(errorTypes[error]); }

const baseErrorSchema = {
    $id: 'baseError',
    type: 'object',
    required: ['code'],
    properties: {
        code: { type: 'string', enum: availableErrorCodes },
        fieldName: { type: 'string' }
    },
    additionalProperties: false
}



function initErrors (fastify) {

    fastify.addSchema(baseErrorSchema);

    fastify.setErrorHandler(async function (error, request, reply) {
        
        if (error.validation) {
            const [ validationError ] = error.validation;
            // console.log(validationError);
    
            switch (validationError.keyword) {
    
                case 'required':
                    return { code: errorTypes.MISSING_PARAM, fieldName: validationError.params.missingProperty }
                    break;
    
                case 'format':
                    return { code: errorTypes.VALIDATION_ERROR, fieldName: validationError.dataPath.split('.')[1] }
                    break;
    
                case 'const':
                    const code = validationError.dataPath.split('.')[1] === 'confirmPassword' ? errorTypes.PASSWORD_MISMATCH : errorTypes.VALIDATION_ERROR;
                    return { ...validationError, code };
                    break;
    
                default:
                    return error;
                    break;
    
            }
        }

        return error;

    });

};



module.exports = {
    initErrors,
    errorTypes
};