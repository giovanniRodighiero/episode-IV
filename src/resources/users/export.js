const csv = require('fast-csv');
const path = require('path');

async function exportUsers (db, config) {
    
    const Users = db.collection('users');

    const rows = [ ['id', 'email', 'role', 'accountConfirmed' ] ];

    try {
        const cursor = await Users.find({  });

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            // process doc here
            rows.push([doc._id.toString(), doc.email, doc.role, doc.accountConfirmed ? 'Sì' : 'No']);
        }

        const fileName = `users-${Date.now()}.csv`;

        return new Promise((resolve, reject) => {
            csv.writeToPath(path.resolve(__dirname, '../../../public/exports/' + fileName), rows)
                .on('error', error => { console.error(error); reject(error); })
                .on('finish', _ => resolve(fileName));
        });

    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = exportUsers;