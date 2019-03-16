const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { seedSettings } = require('../../src/resources/settings/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'GET',
    url: '/api/v1/settings',
    headers: { 'Content-Type': 'application/json' }
};
let fastify, token, tokenUser, tokenUserConfirmed;


describe(`SETTINGS DETAILS testing ${requestsDetails.method} ${requestsDetails.url}`, () => {

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

        beforeAll(done => {
                Promise.all([
                    seedUsers(fastify.mongo.db),
                    seedSettings(fastify.mongo.db, fastify.config)
                ]).then(_ => {
                    fastify.jwt.sign(
                        { email: 'info+admin@crispybacon.it' },
                        { expiresIn: '2 day' },
                        (err, accessToken) => {
                            token = accessToken;
    
                            fastify.jwt.sign(
                                { email: 'info+userconfirmed@crispybacon.it' },
                                { expiresIn: '2 day' },
                                (err, accessToken) => {
                                    tokenUser = accessToken;
                                    done();
                                });
                            });
                });            
        });
        

        test('it should fail for too low account role', async () => {
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

        test('it should succeed for correct account role', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(200);
                expect(payload.meta).toBeInstanceOf(Object);
                expect(payload.meta.title).not.toBeNull();
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        })

    });
});