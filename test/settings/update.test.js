const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { seedSettings } = require('../../src/resources/settings/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

const requestsDetails = {
    method: 'PUT',
    url: '/api/v1/settings',
    headers: { 'Content-Type': 'application/json' }
};
let fastify, token, tokenUser;

describe(`SETTINGS UPDATE testing ${requestsDetails.method} ${requestsDetails.url}`, () => {

    beforeAll(async () => {
        fastify = await buildFastify();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    test('it should fail for invalid token', async () => {
        expect.assertions(2);
        
        requestsDetails.headers['Authorization'] = 'Bearer ' + fakeToken;
        const body = { foo: '' };

        try {
            const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
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
            const body = { foo: '' };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);
    
                expect(statusCode).toBe(403);
                expect(payload.code).toBe(errorTypes.NOT_AUTHORIZED);
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });



        test('it should fail for missing params (meta)', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const body = {  };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).toBe('meta');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }

        });


        test('it should fail for missing params (meta.title)', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const body = { meta: {} };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).toBe('title');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for correct params and account permissions ', async () => {
            expect.assertions(3);

            requestsDetails.headers['Authorization'] = 'Bearer ' + token;
            const projectName = 'new name'
            const body = {
                meta: {
                    image: '',
                    
                    title: `${projectName} - meta title`,
                    description: `${projectName} - meta description`,
            
                    ogUrl: `${projectName} - og url`,
                    ogTitle: `${projectName} - og title`,
                    ogDescription: `${projectName} - og description`,
            
                    twitterUrl: `${projectName} - twitter url`,
                    twitterTitle: `${projectName} - twitter title`,
                    twitterDescription: `${projectName} - twitter description`,
                },
                lang: 'en'
            };

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.meta).toBeInstanceOf(Object);
                expect(payload.meta.title).toBe(`${projectName} - meta title`);
                expect(payload.lang).toBe('en');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });
    
    });

});