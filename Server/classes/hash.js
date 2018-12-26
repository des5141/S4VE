var crypto = require('crypto');
var count = 0;

module.exports.makeHash = function (msg) {
    var shasum = crypto.createHash('sha1');
    shasum.update(msg);
    return shasum.digest('hex');
};

module.exports.autoHash = function () {
    var shasum = crypto.createHash('sha1');
    shasum.update('count'+count);
    return shasum.digest('hex');
};