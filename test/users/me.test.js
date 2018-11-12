const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'GET',
    url: '/api/v1/users/me',
    headers: { 'Content-Type': 'application/json' }
};
let fastify;

describe(`USER PROFILE testing ${requestsDetails.method} ${requestsDetails.url};`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    test('it should fail for missing header auth token', async () => {
        expect.assertions(2);

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

        test('it should fail for non existing account', done => {
            expect.assertions(2);
    
            fastify.jwt.sign({ email: 'info+wrong@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
                requestsDetails.headers['Authorization'] = 'Bearer ' + token;
                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
                    const payload = JSON.parse(_payload);
        
                    expect(statusCode).toBe(401);
                    expect(payload.code).toBe(errorTypes.NOT_AUTHENTICATED);
                    done();
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();
                    done();         
                }
    
            });
        });
    });

    it('should succeed for correct token', done => {
        expect.assertions(5);
    
        fastify.jwt.sign({ email: 'info@crispybacon.it' }, { expiresIn: '1 day' }, async (err, token) => {            
            requestsDetails.headers['Authorization'] = 'Bearer ' + token;

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.email).toBe('info@crispybacon.it');
                expect(payload.role).toBe(100);
                expect(payload.password).toBeUndefined();
                expect(payload.salt).toBeUndefined();
                done();
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
                done();         
            }

        });
    });

});