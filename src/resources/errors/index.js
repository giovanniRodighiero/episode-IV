const { baseErrorSchema } = require('./schema');



function initErrors (fastify) {

    fastify.addSchema(baseErrorSchema);

};



module.exports = initErrors;