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
async function login(id, password) {
    const hashed_pass = hash.makeHash(password);
    const sql = `select * from Users where id='${id}' and password='${hashed_pass}'`;
    var result = false;
    await new Promise((chain, rej) => {
        connection.query(sql, (err, results) => {
            console.log('asd : ' + results);
            if (err) {
                chain(false);
            }
            if (results.length === 0) {
                chain(false);
            }
            if (results.length > 0) {
                chain(true);
            }
        });
    }).then((data) => {
        console.log(data);
        result = data;
    });
    return result;
};
async function register(id, password, name) {
    const pass = hash.makeHash(password);
    const point = 0;
    const sql = `insert into Users values('${id}','${name}','${pass}','${point}')`;
    var result = false;
    await new Promise((a, b) => {
        connection.query(sql, (err) => {
            if (err) {
                result = false;
            }
            result = true;
            a();
        });
    });
    return result;
};

const win_game = point =>
    async id => {
        const sql = `update Users set point=Users.point+${point} where id='${id}'`;
        await new Promise((a, b) => {
            connection.query(sql, (err) => {
                if (err) {
                    result = false;
                }
                result = true;
                a();
            });
        });
        return result;
    };

function end_connection() {
    connection.end();
}


module.exports.register = register;
module.exports.raise_point = win_game(10);
module.exports.login = login;