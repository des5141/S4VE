const assert = require('assert');
const mysql = require('mysql');
const hash = require('../classes/hash');
const db = require('../classes/database');

const connection = mysql.createConnection({
    host: 'ika.today',
    user: 'root',
    password: 'jin123',
    port: '4000',
    database: 'Heroes',
    insecureAuth: true
});
connection.connect();
const name='test_name';
const id='id123';
const password=hash.makeHash('password123');
const point=0;

describe('데이터베이스 테스트', function() {
    before(async ()=>{

    });
    it('로그인 성공 확인',()=>{
        const result = db.login('id123','password123');
        console.log(result);
    })
    after(async()=>{
        connection.end();
        connection.destroy();
    });
});