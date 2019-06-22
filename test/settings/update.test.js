const buildFastify = require('../../server');
const { errorTypes } = require('../../src/resources/errors/schema');
const { seedUsers } = require('../../src/resources/users/seed');
const { seedSettings } = require('../../src/resources/settings/seed');

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AY3Jpc3B5YmFjb24uaXQifQ.pihOQQp-7P1yWWxMs8GsrIkPV6p_JFzAwZhBo-GnISg';

function buildRequest (token, options) {
    return {
        method: 'PUT',
        url: '/api/v1/settings',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        ...options
    }
};
let fastify, token, tokenUser;

const requestsDetails = buildRequest();
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
        
        const body = { payload: { foo: '' } };
        const requestsDetails = buildRequest(fakeToken, body);

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

            const body = { payload: { foo: '' } };
            const requestsDetails = buildRequest(tokenUser, body);
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



        test('it should fail for missing params (meta)', async () => {
            expect.assertions(3);

            const body = { payload: {} };
            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).toBe('meta');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }

        });


        test('it should fail for missing params (meta.title)', async () => {
            expect.assertions(3);

            const body = { payload: { meta: { } } };
            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, payload: body });
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(400);
                expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                expect(payload.fieldName).toBe('image');
            } catch (error) {
                console.log(error);
                expect(error).toBeUndefined();
            }
        });

        test('it should succeed for correct params and account permissions ', async () => {
            expect.assertions(4);

            const projectName = 'new name'
            const body = { payload: {
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
            }};

            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                expect(payload.meta).toBeInstanceOf(Object);
                expect(payload.meta.title).toBe(`${projectName} - meta title`);
                expect(payload.lang).toBe('en');
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });
    
    });

});