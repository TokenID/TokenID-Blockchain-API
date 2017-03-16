'use strict';
const configFile = require(__dirname + '/../../../configurations/configuration.js');
let tracing = require(__dirname + '/../../../tools/traces/trace.js');
let Util = require(__dirname + '/../../../tools/utils/util');
let Issuer = require(__dirname + '/../../../tools/utils/issuer');



function getIssuers(req, res, next) {

    tracing.create('ENTER', 'GET blockchain/issuers', {});
    let securityContext =  configFile.config.securityContext;

    return Util.queryChaincode(securityContext, 'getIssuers', [])
        .then(function (data) {
            let issuers = JSON.parse(data.toString());
            let result = {};
            result.message = 'Issuers fetch successful';
            result.issuers = issuers;
            console.log(issuers);
            tracing.create('EXIT', 'GET blockchain/issuers', {});
            res.json(result);
        })
        .catch(function (err) {
            res.status(400);
            let error = {};
            error.error = true;
            error.message = err;
            tracing.create('ERROR', 'GET blockchain/issuers', err);
            res.json(error);
        });
}

exports.read = getIssuers;
