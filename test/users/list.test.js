const { boot, fastify } = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { USERS } = require('../../src/resources/users/collection');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, query = '') {
    return {
        method: 'GET',
        url: `/api/v1/users${query}`,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    }
};
let token, tokenUser, Users;

const requestsDetails = buildRequest('token');
describe(`USER LIST testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        await boot();
        await fastify.ready();

        Users = fastify.mongo.db.collection(USERS.collectionName);
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        const requestsDetails = buildRequest(fakeToken);

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

        beforeAll(async () => {
            await seedUsers(fastify.mongo.db);
            fastify.log.debug('seeding users done, no errors');
        });

        beforeEach(done => {
            fastify.jwt.sign({ email: 'info@email.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                token = accessToken;
                fastify.jwt.sign({ email: 'info+user@email.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    tokenUser = accessToken;
                    done();
                });
            });
        });

        test('it should fail for invalid page', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(token, '?page=-1');

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for invalid per page quantity', async () => {
            expect.assertions(2);
            
            const requestsDetails = buildRequest(token, '?perPage=-1');

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for non admin account', async () => {
            expect.assertions(2);
    
            const requestsDetails = buildRequest(tokenUser);

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

        test('it should succeed for correct permissions', async () => {
            expect.assertions(10);
    
            const requestsDetails = buildRequest(token);
            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                const count = await Users.countDocuments({ role: { $lt: 100 } })
                
                expect(statusCode).toBe(200);
                expect(payload.totalCount).toBe(count);
                expect(payload.availablePages).toBe(1);
                expect(payload.currentPage).toBe(1);
                expect(payload.nextPage).toBeUndefined();
                expect(payload.data).toHaveLength(count);
                expect(payload.data[0].email).not.toBeUndefined();
                expect(payload.data[0].role).not.toBeUndefined();
                expect(payload.data[0].salt).toBeUndefined();
                expect(payload.data[0].password).toBeUndefined();
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });

    });

});
