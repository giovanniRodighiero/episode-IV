const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, userId) {
    return {
        method: 'GET',
        url: `/api/v1/users/${userId}`,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    }
};
let fastify, token, tokenAdmin, tokenUserConfirmed;

const requestsDetails = buildRequest('token', 'id');
describe(`USER DETAILS testing ${requestsDetails.method} ${requestsDetails.url}:id;`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });
    
    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        const requestsDetails = buildRequest(fakeToken, 'userid');

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
            seedUsers(fastify.mongo.db).then(_ =>{
                fastify.log.debug('seeding users done, no errors');

                fastify.jwt.sign({ email: 'info@email.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    token = accessToken;
                    fastify.jwt.sign({ email: 'info+localadmin@email.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                        tokenAdmin = accessToken;
                        fastify.jwt.sign({ email: 'info+userconfirmed@email.it' }, { expiresIn: '2 day' }, (err, accessTokenConfirmed) => {
                            tokenUserConfirmed = accessTokenConfirmed;
                            done();
                        });
                    });
                });
            });
        });


        test('it should fail for an account with a role too low (< 80)', async () => {
            expect.assertions(2);

            const requestsDetails = buildRequest(tokenUserConfirmed, 'userid');

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

        test('it should fail wrong id format', async () => {
            expect.assertions(2);

            const requestsDetails = buildRequest(token, 'userid');

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

            const requestsDetails = buildRequest(token, '5beaec4f13b92abf84302f26');

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

        test('it should fail for an id of a user with higher role', async () => {
            expect.assertions(2);

            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info@email.it' });
            const requestsDetails = buildRequest(tokenAdmin, _id.toString());

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

        test('it should succeed for correct permissions and id', async () => {
            expect.assertions(2);

            const { _id, email } = await fastify.mongo.db.collection('users').findOne({ email: 'info+userconfirmed@email.it'  }, { email: 1 });
            const requestsDetails = buildRequest(tokenAdmin, _id.toString());

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(200);
                expect(payload.email).toBe(email);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
    
        });
    });

});
