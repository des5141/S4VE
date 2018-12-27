var crypto = require('crypto');

var count = Math.random();

module.exports.makeHash = function (msg) {
    var shasum = crypto.createHash('sha1');
    shasum.update(msg);
    return shasum.digest('hex');
};

module.exports.autoHash = function () {
    var shasum = crypto.createHash('sha1');
    shasum.update('count'+count);
    count+=1;
    return shasum.digest('hex');
};