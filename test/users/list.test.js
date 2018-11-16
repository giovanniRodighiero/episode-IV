const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'GET',
    url: '/api/v1/users',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;
let token, tokenUser;


describe(`USER LIST testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;
        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
            const payload = JSON.parse(_payload);

            expect(statusCode).toBe(401);
            expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    describe('', () => {

        beforeAll(async () => seedUsers(fastify.mongo.db));

        beforeEach(done => {
            fastify.jwt.sign({ email: 'info@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                token = accessToken;
                fastify.jwt.sign({ email: 'info+user@crispybacon.it' }, { expiresIn: '2 day' }, (err, accessToken) => {
                    tokenUser = accessToken;
                    done();
                });
            });
        });

        test('it should fail for invalid page', async () => {
            expect.assertions(2);
            
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const url = requestsDetails.url + '?page=-1';

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for invalid per page quantity', async () => {
            expect.assertions(2);
            
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const url = requestsDetails.url + '?perPage=-1';
            
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, url });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.VALIDATION_ERROR);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should fail for non admin account', async () => {
            expect.assertions(2);
    
            requestsDetails.headers['Authorization'] = 'Bearer ' + tokenUser;
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
    
        });

        test('it should succeed for correct permissions', async () => {
            expect.assertions(10);
    
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
                const payload = JSON.parse(_payload);

                const count = await fastify.mongo.db.collection('users').countDocuments({ role: { $lt: 100 } })
                
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
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

    });

});