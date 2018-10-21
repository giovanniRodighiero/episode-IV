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



/************ CONFIGURATIONS ************/

// TEST CONFIG
const test = {
    port,
    database: {
        url: `${databaseUrl}-test`
    },
    jwtSecret,
    userRoles
}

// DEVELOPMENT CONFIG
const development = {
    port,
    database: {
        url: `${databaseUrl}-development`
    },
    jwtSecret,
    userRoles
}

// PRODUCTION CONFIG
const production = {
    port,
    database: {
        url: `${databaseUrl}-production`
    },
    jwtSecret,
    userRoles
};



module.exports = { test, development, production };