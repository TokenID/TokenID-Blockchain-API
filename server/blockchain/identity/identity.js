var create = require(__dirname+'/CRUD/create.js');
exports.initialize = create.initialize;
exports.create = create.create;

var read = require(__dirname+'/CRUD/read.js');
exports.getPublicKey = read.getPublicKey;
exports.getIdentities = read.getIdentities
exports.getIdentity = read.getIdentity

var del = require(__dirname+'/CRUD/delete.js');
exports.removeIdentity = del.removeIdentity;
