const hash = require('./hash.js');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'ika.today',
    user: 'root',
    password: 'jin123',
    port: '4000',
    database: 'Heroes',
    insecureAuth: true,
    multipleStatements:true,
});

connection.connect();

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});

async function sql_connection_check() {
    if (connection.state === 'disconnected') {
        connection.connect();
    }
}

async function login(id, password) {
    sql_connection_check();
    const hashed_pass = hash.makeHash(password);
    const sql = `select * from Users where id='${id}' and password='${hashed_pass}'`;
    var result = false;
    await new Promise((chain, rej) => {
        connection.query(sql, (err, results) => {
            if (err) {
                chain(false);
            }
            if (results.length === 0) {
                chain({exist:false});
            }
            if (results.length > 0) {
                chain({exist:true,name:results[0].name});
            }
        });
    }).then((data) => {
        result = data;
    });
    return result;
};
async function register(id, password, name) {
    sql_connection_check();
    const pass = hash.makeHash(password);
    const point = 0;
    const sql = `insert into Users values('${id}','${name}','${pass}','${point}',0)`;
    var result = false;
    await new Promise((a, b) => {
        connection.query(sql, (err) => {
            if (err) {
                result = false;
            } else {
                result = true;
            }
            a();
        });
    });
    return result;
};

const raise_point = point =>
    async id => {
        sql_connection_check();
        var result = false;
        const sql = `update Users set point=Users.point+${point} where id='${id}'`;
        await new Promise((a, b) => {
            connection.query(sql, (err) => {
                if (err) {
                    result = false;
                }
                else {
                    result = true;
                }
                a();
            });
        });
        return result;
    };
function end_connection() {
    connection.end();
}

async function save_play(id, userid, champ, win, team_name, game_id) {
    sql_connection_check();
    const sql = `insert into PlayHistory values('${id}','${userid}','${champ}',${win},'${team_name}','${game_id}')`;
    var result = false;
    await new Promise((a, b) => {
        connection.query(sql, (err) => {
            if (err) {
                result = false;
            }
            else {
                result = true;
            }
            a();
        });
    });
    return result;
}

async function ShowMeTheMoney(id, money) {
    sql_connection_check();
    var result = false;
    const sql = `update Users set money=Users.money+${money} where id='${id}'`;
    await new Promise((a, b) => {
        connection.query(sql, (err) => {
            if (err) {
                result = false;
            }
            else {
                result = true;
            }
            a();
        });
    });
    return result;
};

async function check_money(id, price) {
    sql_connection_check();
    var result = false;
    const sql = `select * from Users where id='${id}'`;
    await new Promise((a, b) => {
        connection.query(sql, (err,results) => {
            if (err) {
                result = false;
            }
            else {
                result = results[0].money>=price;
            }
            a();
        });
    });
    return result;
};

async function buy_items(id, item) {
    sql_connection_check();
    var result = false;
    new Promise((a,b)=>{
        check_money(id,item.price).then(x=>{
            if(x){
                const sql = `update Users set money=Users.money-${item.price} where id='${id}'; insert into Items values('${item.name}','${id}',${item.price});`;
                connection.query(sql, (err,results) => {
                    if (err) {
                        result = false;
                    }
                    else {
                        result = true;
                    }
                    a();
                });
            }
            a();
        });
    });
    return result;
};

module.exports.register = register;
module.exports.raise_point = raise_point;
module.exports.login = login;
module.exports.end = end_connection;
module.exports.save_play = save_play;
module.exports.showmeyhemoney = ShowMeTheMoney;