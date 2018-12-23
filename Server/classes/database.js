const hash = require('./hash.js');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'ika.today',
    user: 'root',
    password: 'jin123',
    port: '4000',
    database: 'Heroes',
    insecureAuth: true
});
connection.connect();
async function login(id, password) {
    const hashed_pass = hash.makeHash(password);
    const sql = `select * from Users where id='${id} and password='${hashed_pass}'`;
    var result = false;
    console.log(result);
    new Promise((chain, rej) => {
        connection.query(sql, (err, results) => {
            console.log('asd' + results);
            if (err) {
                chain(false);
            }
            else {
                chain(true);
            }
        });
    }).then((data) => {
        result = data;
    })
    return result;
};

console.log(await login());
module.exports.login = login;