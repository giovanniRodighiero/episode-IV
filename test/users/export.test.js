const MongoClient = require('mongodb').MongoClient;
const fs = require('fs').promises;
const path = require('path');
const csv = require('fast-csv');

const { seedUsers } = require('../../src/resources/users/seed');
const exportUsers = require('../../src/resources/users/export');

const allConfigs = require('../../config');
const config = allConfigs.test;

let client, db, _filename;

function parseFile (path) {
    return new Promise((resolve, reject) => {
        const data = [];
        csv.parseFile(path)
            .on('error', error => reject(error))
            .on('data', arg => data.push(arg))
            .on('end', _ => resolve(data));
    });
}

jest.setTimeout(10000);
describe('USER EXPORT TEST', () => {

    beforeAll(async () => {
        client = await MongoClient.connect(config.database.url, { useNewUrlParser: true });
        db = client.db(config.database.name);
        await seedUsers(db);
    });

    afterAll(async () => {
        await client.close();
    });

    afterEach(async () => {
        await fs.unlink(path.resolve(__dirname, `../../public/exports/${_filename}`));
    });

    test('it should succeed for base seed', async () => {
        expect.assertions(2);

        try {
            const userCount = await db.collection('users').countDocuments({});
            const filename = await exportUsers(db, config);
            _filename = filename;
    
            expect(filename).not.toBeNull();
            const data = await parseFile(path.resolve(__dirname, `../../public/exports/${filename}`));
            expect(userCount).toBe(data.length - 1);
        } catch (error) {
            console.log(error)
        }
    });
});
