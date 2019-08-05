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
const metaObject = {
    image: `....`,
    title: `title`,
    description: `meta description`,

    ogUrl: `og url`,
    ogTitle: `og title`,
    ogDescription: `og description`,

    twitterUrl: `twitter url`,
    twitterTitle: `twitter title`,
    twitterDescription: `twitter description`,
};

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

        test('it should fail for missing lang param', async () => {
            expect(3 * fastify.config.availableLangs.length);

            for (const lang of fastify.config.availableLangs) {
                const body = { payload: {  } };

                fastify.config.availableLangs.forEach(lang => body.payload[lang] = { meta: metaObject });
                delete body.payload[lang];

                const requestsDetails = buildRequest(token, body);

                try {
                    const { statusCode, payload: _payload } = await fastify.inject({ ...requestsDetails, body });
                    const payload = JSON.parse(_payload);

                    expect(statusCode).toBe(400);
                    expect(payload.code).toBe(errorTypes.MISSING_PARAM);
                    expect(payload.fieldName).toBe(lang);
                } catch (error) {
                    console.log(error);
                    expect(error).toBeUndefined();
                }
            }
        })

        test('it should succeed for correct params and account permissions ', async () => {
            expect.assertions((2 * fastify.config.availableLangs.length) + 1);

            const body = { payload: {} };
            fastify.config.availableLangs.forEach(lang => body.payload[lang] = { meta: metaObject });

            const requestsDetails = buildRequest(token, body);

            try {
                const { statusCode, payload: _payload } = await fastify.inject(requestsDetails);
                const payload = JSON.parse(_payload);

                expect(statusCode).toBe(200);
                for (const lang of fastify.config.availableLangs) {
                    expect(payload[lang].meta).toBeInstanceOf(Object);
                    expect(payload[lang].meta.title).toBe(metaObject.title);
                }
            } catch (error) {
                fastify.log.error(error);
                expect(error).toBeUndefined();
            }
        });
    
    });

});