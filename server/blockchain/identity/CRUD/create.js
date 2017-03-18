'use strict';
const configFile = require(__dirname + '/../../../configurations/configuration.js');
let tracing = require(__dirname + '/../../../tools/traces/trace.js');
let Util = require(__dirname + '/../../../tools/utils/util');
let Identity = require(__dirname + '/../../../tools/utils/identity');
const pem = require('pem')
const ursa = require('ursa')

function create(req, res, next) {
    let securityContext = configFile.config.securityContext;

    let chainCodeID = req.get(configFile.config.chainCodeIDHeaderName);
    if (!chainCodeID) {
        res.status(400).json({ message: "No Chaincode ID found in request header :" + configFile.config.chainCodeIDHeaderNam });
        return;
    }
    securityContext.setChaincodeID(chainCodeID)

    let identity = new Identity(securityContext);
    let reqBody = req.body
    let providerEnrollmentID = req.params.providerEnrollmentID;

    if (!reqBody) {
        res.status(400).json({ message: "Request body cannot be empty" });
        return;
    }

    if (!reqBody.identityCode) {
        res.status(400).json({ message: "'identityCode' required" });
        return
    }
    if (!reqBody.identityTypeCode) {
        res.status(400).json({ message: "'identityTypeCode' required" });
        return
    }
    if (!reqBody.identityPayload) {
        res.status(400).json({ message: "'identityPayload' required" });
        return
    }
    if (!reqBody.issuerID) {
        res.status(400).json({ message: "'issuerID' required" });
        return
    }

    return identity.create(providerEnrollmentID, reqBody.identityCode, reqBody.identityTypeCode, reqBody.identityPayload, reqBody.issuerID, reqBody.metaData, reqBody.attachmentURI,reqBody.issuerCode, reqBody.issuerOrganization)
        .then(function (enrolledIssuer) {
            tracing.create('INFO', 'POST blockchain/identity/' + providerEnrollmentID, 'Identity ' + reqBody.identityCode + ' added');
            let result = {};
            result.message = 'Identity added successful';
            res.end(JSON.stringify(result));
        })
        .catch(function (err) {
            tracing.create('ERROR', 'POST blockchain/identity/' + providerEnrollmentID, err.stack);
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

        if (modulus.length != 256) { // 2048 bit key size
            res.status(400).json({ message: "identityPublicKey - Invalid key size. Must be 2048 bit. Currently " + info.keyBitSize });
            return
        }
        return identity.initialize(reqBody.providerEnrollmentID, identityPublicKey)
            .then(function (data) {
                tracing.create('INFO', 'POST blockchain/identity/initialize/new', 'Initialized Identity');
                let result = {};
                result.message = data.message;
                result.chaincodeID =  data.chaincodeID;
                result.providerEnrollmentID = reqBody.providerEnrollmentID;
                res.json(result);
            })
            .catch(function (err) {
                tracing.create('ERROR', 'POST blockchain/identity/initialize/new', err.stack);
                res.status(500).json({ 'message': err.stack });
            });
    }
    catch (ex) {
        res.status(400).json({ message: "identityPublicKey - Invalid PEM public key" });
        return
    }





}

exports.initialize = initialize;
