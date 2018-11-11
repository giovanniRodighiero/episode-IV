const { baseErrorSchema, errorTypes } = require('./schema');


function initErrors (fastify) {

    fastify.addSchema(baseErrorSchema);

    fastify.setErrorHandler(async function (error, request, reply) {
        
        if (error.validation) {
            const [ validationError ] = error.validation;
    
            switch (validationError.keyword) {
    
                case 'required':
                    return { code: errorTypes.MISSING_PARAM, fieldName: validationError.params.missingProperty }
                    break;
    
                case 'format':
                    return { code: errorTypes.VALIDATION_ERROR, fieldName: validationError.dataPath.split('.')[1] };
                    break;
    
                case 'const':
                    const code = validationError.dataPath.split('.')[1] === 'confirmPassword' ? errorTypes.PASSWORD_MISMATCH : errorTypes.VALIDATION_ERROR;
                    return { ...validationError, code };
                    break;

                case 'minLength':
                    return { code: errorTypes.MISSING_PARAM, fieldName: validationError.dataPath.split('.')[1] };
                    break;
    
                default:
                    return error;
                    break;
    
            }
        }

        return error;

    });

};



module.exports = initErrors;