'use strict';
const configFile = require(__dirname + '/../../../configurations/configuration.js');
let tracing = require(__dirname + '/../../../tools/traces/trace.js');
let Util = require(__dirname + '/../../../tools/utils/util');
let Issuer = require(__dirname + '/../../../tools/utils/issuer');
let Identity = require(__dirname + '/../../../tools/utils/identity');
const pem = require('pem')
const ursa = require('ursa')

function create(req, res, next) {
    let securityContext = configFile.config.securityContext;

    let issuer = new Issuer(securityContext);
    let reqBody = req.body

    if (!reqBody) {
        res.status(400).json({ message: "Request body cannot be empty" });
        return;
    }
    if (!reqBody.enrollID) {
        res.status(400).json({ message: "'enrollID' required" });
        return
    }
    if (!reqBody.issuerCode) {
        res.status(400).json({ message: "'issuerCode' required" });
        return
    }
    if (!reqBody.issuerID) {
        res.status(400).json({ message: "'issuerID' required" });
        return
    }
    if (!reqBody.organization) {
        res.status(400).json({ message: "'organization' required" });
        return
    }
    if (!reqBody.organization) {
        res.status(400).json({ message: "'organization' required" });
        return
    }
    if (!reqBody.identityCodes || reqBody.identityCodes.length === 0) {
        res.status(400).json({ message: "'identityCodes' required. Must have at least 1 identity code" });
        return
    }

    return issuer.create(reqBody.enrollID, reqBody.issuerID, reqBody.issuerCode, reqBody.organization, reqBody.identityCodes)
        .then(function (enrolledIssuer) {
            tracing.create('INFO', 'POST blockchain/issuers', 'Created Issuer');
            let result = {};
            result.message = 'Issuer registration successful';
            result.issuer = {};
            result.issuer.enrollID = enrolledIssuer.name;
            result.issuer.enrollmentSecret = enrolledIssuer.enrollmentSecret;
            result.issuer.enrollment = {}
            result.issuer.enrollment.key = enrolledIssuer.enrollment.key;
            result.issuer.enrollment.cert = enrolledIssuer.enrollment.cert;
            result.issuer.enrollment.chainKey = enrolledIssuer.enrollment.chainKey;
            result.issuer.enrollment.queryStateKey = enrolledIssuer.enrollment.queryStateKey;

            res.end(JSON.stringify(result));
        })
        .catch(function (err) {
            tracing.create('ERROR', 'POST blockchain/issuers', err.stack);
            res.status(500).json({ 'message': err.stack });
        });
}

exports.create = create;


function initialize(req, res, next) {
    let securityContext = configFile.config.securityContext;

    let identity = new Identity(securityContext);
    let reqBody = req.body

    if (!reqBody) {
        res.status(400).json({ message: "Request body cannot be empty" });
        return;
    }
    if (!reqBody.providerEnrollmentID) {
        res.status(400).json({ message: "'providerEnrollmentID' required" });
        return
    }
    if (!reqBody.identityPublicKey) {
        res.status(400).json({ message: "'identityPublicKey' required. Must be an RSA 2048bit public key in PEM format" });
        return
    }
    let identityPublicKey = decodeURIComponent(reqBody.identityPublicKey);
    try {
        let pk = ursa.createPublicKey(identityPublicKey)
        let modulus = pk.getModulus()

        if (modulus.length != 256){ // 2048 bit key size
            res.status(400).json({ message: "identityPublicKey - Invalid key size. Must be 2048 bit. Currently " + info.keyBitSize });
            return
        }
        return identity.initialize(reqBody.providerEnrollmentID, identityPublicKey)
            .then(function (data) {
                tracing.create('INFO', 'POST blockchain/identity/initialize', 'Initialized Identity');
                let result = {};
                result.message = 'Identity initialization successful';
                result.providerEnrollmentID = reqBody.providerEnrollmentID;
                res.json(result);
            })
            .catch(function (err) {
                tracing.create('ERROR', 'POST blockchain/identity/initialize', err.stack);
                res.status(500).json({ 'message': err.stack });
            });
    }
    catch (ex) {
        res.status(400).json({ message: "identityPublicKey - Invalid PEM public key" });
        return
    }





}

exports.initialize = initialize;
