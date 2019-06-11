const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, userId) {
    return {
        method: 'DELETE',
        url: `/api/v1/users/${userId}`,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    }
};
let fastify, tokenSuperadmin, tokenUser, tokenAdmin;

const requestsDetails = buildRequest('token', 'id');
describe(`USER DELETE testing ${requestsDetails.method} ${requestsDetails.url}:id;`, () => {

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
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeEach(done => {
            seedUsers(fastify.mongo.db).then(_ => {
                fastify.jwt.sign({ email: 'info+admin@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    tokenSuperadmin = accessToken;
                    fastify.jwt.sign({ email: 'info+userconfirmed@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                        tokenUser = accessToken;
                        fastify.jwt.sign({ email: 'info+localadmin@crispybacon.it'}, { expiresIn: '2 day' }, (err, accessToken) => {
                            tokenAdmin = accessToken;
                            done();
                        });
                    });
                });
            });
        });

        test('it should fail for an account with a role too low (< 80)', async () => {
            expect.assertions(2);

            const requestsDetails = buildRequest(tokenUser, 'userid');
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for wrong id format', async () => {
            expect.assertions(2);

            const requestsDetails = buildRequest(tokenSuperadmin, 'userid');
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for a non existing account', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(tokenSuperadmin, '5beaec4f13b92abf84302f26');

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(404);
                expect(payload.code).toBe(errorTypes.NOT_FOUND);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for same person id', async () => {
            expect.assertions(2);

            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+admin@crispybacon.it' }
            );
            const requestsDetails = buildRequest(tokenSuperadmin, _id.toString());

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should fail for id of a user with higher role', async () => {
            expect.assertions(2);

            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+admin@crispybacon.it' });
            const requestsDetails = buildRequest(tokenAdmin, _id.toString());

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should succeed for correct permissions and id', async () => {
            expect.assertions(2);

            const { _id } = await fastify.mongo.db.collection('users').findOne({ email: 'info+localadmin@crispybacon.it' }, { _id: 1 });
            const requestsDetails = buildRequest(tokenSuperadmin, _id.toString());

            try {
                const { statusCode } = await fastify.inject(requestsDetails);
    
                expect(statusCode).toBe(204);
                const deletedUser = await fastify.mongo.db.collection('users').findOne({ _id });
                expect(deletedUser).toBeNull();
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });
    });
});