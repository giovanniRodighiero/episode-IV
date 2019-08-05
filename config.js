/************ SHARED ************/
const projectName = 'project-name';
const databaseUrl = `mongodb://localhost:27017/${projectName}`;
const port = 4000;
const jwtSecret = '7612ca2ee54e1583a3281c5d22c5504df2862574fe28e3f86a8a736a5b4ea2cce560d5b8b0c6ab14d852a60e2fe38ab8'
const userRoles = {
    CRISPY: 100,
    SUPERADMIN: 90,
    ADMIN: 80,
    USER: 70
};
const availableLangs = ['it', 'en'];


/************ CONFIGURATIONS ************/

// TEST CONFIG
const test = {
    projectName,
    port,
    database: {
        url: `${databaseUrl}-test`,
        name: `${projectName}-test`
    },
    jwtSecret,
    userRoles,
    mailer: {
        nodemailerConf: {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'i6t2mlf4ld4pwqct@ethereal.email',
                pass: 'u8hR4an9ArfZ8aAtef'
            }
        },
        from: 'noreply@crispybacon.it'
    },
    address: `http://localhost:${port}`,
    availableLangs
}

// DEVELOPMENT CONFIG
const development = {
    projectName,
    port,
    database: {
        url: `${databaseUrl}-development`,
        name: `${projectName}-development`
    },
    jwtSecret,
    userRoles,
    mailer: {
        nodemailerConf: {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'i6t2mlf4ld4pwqct@ethereal.email',
                pass: 'u8hR4an9ArfZ8aAtef'
            }
        },
        from: 'noreply@crispybacon.it'
    },
    address: `http://localhost:${port}`,
    availableLangs
}

// PRODUCTION CONFIG
const production = {
    projectName,
    port,
    database: {
        url: `${databaseUrl}-production`,
        name: `${projectName}-production`
    },
    jwtSecret,
    userRoles,
    mailer: {
        nodemailerConf: {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'i6t2mlf4ld4pwqct@ethereal.email',
                pass: 'u8hR4an9ArfZ8aAtef'
            }
        },
        from: 'noreply@crispybacon.it'
    },
    address: `http://localhost:${port}`,
    availableLangs
};

// STAGING CONFIG
const staging = {
    port,
    database: {
        url: `${databaseUrl}-production`,
        name: `${projectName}-production`
    },
    jwtSecret,
    userRoles,
    mailer: {
        nodemailerConf: {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'i6t2mlf4ld4pwqct@ethereal.email',
                pass: 'u8hR4an9ArfZ8aAtef'
            }
        },
        from: 'noreply@crispybacon.it'
    },
    address: `http://localhost:${port}`,
    availableLangs
}



module.exports = { test, development, staging, production };