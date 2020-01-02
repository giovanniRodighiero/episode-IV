// NODE ENV CONSTANTS
const TEST = 'test';
const TEST_DEBUG = 'test-debug';
const DEVELOPMENT = 'development';
const STAGING = 'staging';
const PRODUCTION = 'production';

const ENV = {
    DEFAULT: DEVELOPMENT,
    AVAILABLE: [TEST, TEST_DEBUG, DEVELOPMENT, STAGING, PRODUCTION],
    TEST,
    TEST_DEBUG,
    DEVELOPMENT,
    STAGING,
    PRODUCTION
};


//CONFIGURATIONS
const projectName = 'project-name';
const databaseUrl = `mongodb://localhost:27017/${projectName}`;

// let override config env for testing
function buildConfig (env = process.env.NODE_ENV) {

    let settings = {
        port: 4000,

        availableLangs: ['it', 'en'],

        database: {},

        jwtSecret: '7612ca2ee54e1583a3281c5d22c5504df2862574fe28e3f86a8a736a5b4ea2cce560d5b8b0c6ab14d852a60e2fe38ab8',

        userRoles: {
            CRISPY: 100,
            SUPERADMIN: 90,
            ADMIN: 80,
            USER: 70
        },

        mailer: {
            nodemailerConf: {
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'i6t2mlf4ld4pwqct@ethereal.email',
                    pass: 'u8hR4an9ArfZ8aAtef'
                }
            },
            from: 'noreply@email.it'
        },
    };

    settings.address= `http://localhost:${settings.port}`;

    switch (env) {
        case ENV.TEST_DEBUG:
        case ENV.TEST:
            settings.database.url = `${databaseUrl}-test`;
            settings.database.name = `${projectName}-test`;
            break;

        case ENV.STAGING:
            settings.database.url = `${databaseUrl}-staging`;
            settings.database.name = `${projectName}-staging`;
            break;

        case ENV.PRODUCTION:
            settings.database.url = `${databaseUrl}-production`;
            settings.database.name = `${projectName}-production`;
            break;

        case ENV.DEVELOPMENT:
        default:
            settings.database.url = `${databaseUrl}-development`;
            settings.database.name = `${projectName}-development`;
            break;
    }

    return settings;
}

module.exports = {
    ENV,
    config: buildConfig,
};
