const { errorTypes } = require('../resources/errors/schema');

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

const authenticationMiddleware = function (request, reply, next) {
    const authHeader = request.headers['authorization'];

    // HEADER NOT PROVIDED
    if (!authHeader)
        return notAuthorized(reply);

    const [ protocol, token ] = authHeader.split(' ');

    // TOKEN NOT PROVIDED
    if (!token)
        return notAuthorized(reply);

    this.jwt.verify(token, async (err, decoded) => {
        // TOKEN MALFORMED OR EXPIRED
        if (err)
            return notAuthorized(reply);
        
        const Users = this.mongo.db.collection('users');
        const { email, iat } = decoded;

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

            next();
        } catch (error) {
            console.log(error)
            reply.code(500);
            reply.send({ code: errorTypes.INTERNAL_SERVER_ERROR });
            return;
        }
    });
}

module.exports = authenticationMiddleware;