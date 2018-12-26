const assert = require('assert');
const hash = require('../classes/hash');
const db = require('../classes/database');

describe('데이터베이스 테스트', function () {
    before(async () => {
        await db.register('id123','password123','LAs');
    });
    it('로그인', async() => {
            await db
            .login('id123', 'password123')
            .then(data => {
                assert.deepEqual(data.exist, true);
                assert.deepEqual(data.name,'LAs');
            });
    });
    it('포인트 증가', async() => {
        await db
            .raise_point(23)('id123')
            .then(data =>
                assert.deepEqual(data, true)
            );
    });
    it('유저 게임 결과 기록', async() => {
        await db
            .save_play('id123', 'asdfadsgbtrhc', 'champ', 20, 'TeamA', 'sdfgiojfsdlgkjs')
            .then(data =>
                assert.deepEqual(data, false)
            );
    });
    after(async () => {
        db.end();
    });
});