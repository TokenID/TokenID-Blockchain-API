'use strict';
const configFile = require(__dirname + '/../../../configurations/configuration.js');
let tracing = require(__dirname + '/../../../tools/traces/trace.js');
let Util = require(__dirname + '/../../../tools/utils/util');



function getPublicKey(req, res, next) {


    tracing.create('ENTER', 'GET blockchain/identity/' + req.params.providerEnrollmentID + '/publicKey', {});
    let securityContext = configFile.config.securityContext;

    let chainCodeID = req.get(configFile.config.chainCodeIDHeaderName);
    if (!chainCodeID) {
        res.status(400).json({ message: "No Chaincode ID found in request header :" + configFile.config.chainCodeIDHeaderNam });
        return;
    }
    securityContext.setChaincodeID(chainCodeID)


    Util.queryChaincode(securityContext, 'getPublicKey', [req.params.providerEnrollmentID])
        .then(function (data) {
            let pk = data.toString();
            let result = {};
            result.message = 'Public Key fetch successful';
            result.identityPublicKey = encodeURIComponent(pk);
            console.log(result);
            tracing.create('EXIT', 'GET blockchain/identity/' + req.params.providerEnrollmentID + '/publicKey', {});
            res.json(result);
        })
        .catch(function (err) {
            res.status(400);
            let error = {};
            error.error = true;
            error.message = err.message;
            tracing.create('ERROR', 'GET blockchain/identity/' + req.params.providerEnrollmentID + '/publicKey', err);
            res.json(error);
        });
}

exports.getPublicKey = getPublicKey;

function getIdentities(req, res, next) {


    tracing.create('ENTER', 'GET blockchain/identity/' + req.params.providerEnrollmentID, {});
    let securityContext = configFile.config.securityContext;

    let chainCodeID = req.get(configFile.config.chainCodeIDHeaderName);
    if (!chainCodeID) {
        res.status(400).json({ message: "No Chaincode ID found in request header :" + configFile.config.chainCodeIDHeaderNam });
        return;
    }
    securityContext.setChaincodeID(chainCodeID)

    Util.queryChaincode(securityContext, 'getIdentities', [req.params.providerEnrollmentID])
        .then(function (data) {
            let identities = JSON.parse(data.toString());
            let result = {};
            result.message = 'Identities fetch successful';
            result.identities = identities;
            console.log(identities);
            tracing.create('EXIT', 'GET blockchain/identity/' + req.params.providerEnrollmentID, {});
            res.json(result);
        })
        .catch(function (err) {
            res.status(400);
            let error = {};
            error.error = true;
            error.message = err;
            tracing.create('ERROR', 'GET blockchain/identity/' + req.params.providerEnrollmentID, err);
            res.json(error);
        });
}

exports.getIdentities = getIdentities;


function getIdentity(req, res, next) {

    tracing.create('ENTER', 'GET blockchain/identity/' + req.params.providerEnrollmentID + '/' + req.params.identityCode, {});
    
    let securityContext = configFile.config.securityContext;
    let chainCodeID = req.get(configFile.config.chainCodeIDHeaderName);
    if (!chainCodeID) {
        res.status(400).json({ message: "No Chaincode ID found in request header :" + configFile.config.chainCodeIDHeaderNam });
        return;
    }
    securityContext.setChaincodeID(chainCodeID)

    Util.queryChaincode(securityContext, 'getIdentity', [req.params.providerEnrollmentID, req.params.identityCode])
        .then(function (data) {
            let identity = JSON.parse(data.toString());
            let result = {};
            result.message = 'Identity fetch successful';
            result.identity = identity;
            console.log(identity);
            tracing.create('EXIT', 'GET blockchain/identity/' + req.params.providerEnrollmentID + '/' + req.params.identityCode, {});
            res.json(result);
        })
        .catch(function (err) {
            res.status(400);
            let error = {};
            error.error = true;
            error.message = err;
            tracing.create('ERROR', 'GET blockchain/identity/' + req.params.providerEnrollmentID + '/' + req.params.identityCode, err);
            res.json(error);
        });
}

exports.getIdentity = getIdentity;
