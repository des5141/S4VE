const assert = require('assert');
const hash = require('../classes/hash');
const db = require('../classes/database');

describe('데이터베이스 테스트', function () {
    before(async () => {
        db
            .register('id123', 'password123', 'LAs')
            .then((data) => {
                assert.deepEqual(data, true);
            });
    });
    it('로그인', () => {
        db
            .login('id123', 'password123')
            .then(data =>
                assert.deepEqual(data, true)
            );
    });
    it('포인트 증가', () => {
        db
            .raise_point(23)('id123')
            .then(data =>
                assert.deepEqual(data, true)
            );
    });
    it('유저 게임 결과 기록', () => {
        db
            .save_play('id123','asdfadsgbtrhc','champ',20,'TeamA','sdfgiojfsdlgkjs')
            .then(data =>
                assert.deepEqual(data, true)
            );
    });
    after(async () => {
        db.end();
    });
});