'use strict';
const configFile = require(__dirname + '/../../../configurations/configuration.js');
let tracing = require(__dirname + '/../../../tools/traces/trace.js');
let Util = require(__dirname + '/../../../tools/utils/util');
let Identity = require(__dirname + '/../../../tools/utils/identity');


function removeIdentity(req, res, next) {
    let securityContext = configFile.config.securityContext;

    let chainCodeID = req.get(configFile.config.chainCodeIDHeaderName);
    if (!chainCodeID) {
        res.status(400).json({ message: "No Chaincode ID found in request header :" + configFile.config.chainCodeIDHeaderNam });
        return;
    }
    securityContext.setChaincodeID(chainCodeID)
    let identity = new Identity(securityContext);
    let providerEnrollmentID = req.params.providerEnrollmentID;
    let identityCode = req.params.identityCode;

    return identity.delete(providerEnrollmentID, identityCode)
        .then(function (data) {
            let result = {};
            result.message = 'Identity removed successful';
            tracing.create('INFO', 'DELETE blockchain/identity/' + providerEnrollmentID + '/' + identityTypeCode, data );
            res.json(result);
        })
        .catch(function (err) {
            tracing.create('ERROR', 'DELETE blockchain/identity/' + providerEnrollmentID + '/' + identityTypeCode, err);
            res.status(500).json({ error : true, 'message': err.stack });
        });
}
exports.removeIdentity = removeIdentity;
