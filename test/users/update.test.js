const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { USERS } = require('../../src/resources/users/collection');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, userid, options) {
    return {
        method: 'PUT',
        url: `/api/v1/users/${userid}`,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        ...options
    }
};
let fastify, tokenSuperadmin, tokenAdmin, tokenUserConfirmed, Users;

const requestsDetails = buildRequest('token', ':id');
describe(`USER UPDATE testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();

        Users = fastify.mongo.db.collection(USERS.collectionName);
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);

        const requestsDetails = buildRequest(fakeToken, 'fakeid', { payload: { email: 'newmail@mail.it' } });

        try {
            const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            fastify.log.error(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(done => {
            const opts = { expiresIn: '2 day' };
            seedUsers(fastify.mongo.db).then( _ => {
                fastify.jwt.sign({ email: 'info+admin@crispybacon.it' }, opts, (err, accessToken) => {
                    tokenSuperadmin = accessToken;
                    fastify.jwt.sign({ email: 'info+localadmin@crispybacon.it' }, opts, (err, accessToken) => {
                        tokenAdmin = accessToken;
                        fastify.jwt.sign({ email: 'info+userconfirmed@crispybacon.it' }, opts, (err, accessTokenConfirmed) => {
                            tokenUserConfirmed = accessTokenConfirmed;
                            done();
                        });
                    });
                });
            });
        });

        test('it should fail for an account with a role too low (< 80)', async () => {
            expect.assertions(2);

            const body = { payload: { email: 'newmail@mail.it' } };
            const requestsDetails = buildRequest(tokenUserConfirmed, 'userid', body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an invalid mongo id', async () => {
            expect.assertions(2);

            const body = { payload: { email: 'newmail@mail.it' } };
            const requestsDetails = buildRequest(tokenSuperadmin, 'userid', body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for a non existing account', async () => {
            expect.assertions(2);

            const body = { payload: { email: 'newmail@mail.it' } };
            const requestsDetails = buildRequest(tokenSuperadmin, '5beaec4f13b92abf84302f26', body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for same person id', async () => {
            expect.assertions(2);

            const { _id } = await Users.findOne({ email: 'info+admin@crispybacon.it' });
            const body = { payload: { email: 'newmail@mail.it' } };
            const requestsDetails = buildRequest(tokenSuperadmin, _id.toString(), body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for id of a user with higher role', async () => {
            expect.assertions(2);

            const { _id } = await Users.findOne({ email: 'info+admin@crispybacon.it' });
            const body = { payload: { email: 'newmail@mail.it' } };
            const requestsDetails = buildRequest(tokenAdmin, _id.toString(), body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail updating a role higher than the user making the request', async () => {
            expect.assertions(2);

            const { _id } = await Users.findOne({ email: 'info+userconfirmed@crispybacon.it' });
            const body = { payload: { role: fastify.config.userRoles.SUPERADMIN } };
            const requestsDetails = buildRequest(tokenAdmin, _id.toString(), body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for an already in use email', async () => {
            expect.assertions(2);

            const { _id } = await Users.findOne({ email: 'info+userconfirmed@crispybacon.it' });
            const body = { payload: { email: 'userfake3@crispybacon.it' } };
            const requestsDetails = buildRequest(tokenAdmin, _id.toString(), body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(409);
                expect(payload.code).toBe(errorTypes.ALREADY_EXISTING);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });
        
        
        test('it should succeed for correct params', async () => {
            expect.assertions(2);

            const { _id } = await Users.findOne({ email: 'info+userconfirmed@crispybacon.it' });
            const body = { payload: { email: 'usernuovissimo@crispybacon.it' } };
            const requestsDetails = buildRequest(tokenAdmin, _id.toString(), body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.email).toBe('usernuovissimo@crispybacon.it');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

    });
});