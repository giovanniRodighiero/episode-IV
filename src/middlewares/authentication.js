const { errorTypes } = require('../resources/errors/schema');
const { USERS } = require('../resources/users/collection');

const profileProjection = {
    email: 1,
    role: 1,
    accountConfirmed: 1,
    tokenMinValidity: 1
};

function notAuthorized (reply) {
    reply.code(401);
    reply.send({ code: errorTypes.NOT_AUTHENTICATED, field: 'token' });
    return;
}

const authenticationMiddleware = async function (request, reply) {

    try {
        await request.jwtVerify();
    } catch (error) {
        return notAuthorized(reply); 
    }

    const Users = this.mongo.db.collection(USERS.collectionName);
    const { email, iat } = request.user;

    try {
        const user = await Users.findOne({ email }, profileProjection);

        // CHECK FOR USER EXISTENCE
        if (!user)
            return notAuthorized(reply);

        // CHECK FOR BLACKLISTED TOKEN
        if (!!user.tokenMinValidity && (iat * 1000) < user.tokenMinValidity)
            return notAuthorized(reply);
        
        // ALL FINE, FORWARD USER PROFILE
        request.user = user;

        return;
    } catch (error) {
        request.log.error(error);
        reply.code(500);
        reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
        return;
    }
}

module.exports = authenticationMiddleware;