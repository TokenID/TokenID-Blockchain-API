'use strict';
const configFile = require(__dirname+'/../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../tools/traces/trace.js');
let Util = require(__dirname+'/../../../tools/utils/util');
let Issuer = require(__dirname+'/../../../tools/utils/issuer');

function create (req, res, next) {
    let securityContext =  configFile.config.securityContext;

    let issuer = new Issuer(securityContext);
    let reqBody = req.body

    if(!reqBody)
    {
        res.status(400).json({message : "Request body cannot be empty"});
        return;
    }
    if(!reqBody.enrollID){
        res.status(400).json({message : "'enrollID' required"});
        return
    }
    if(!reqBody.issuerCode){
        res.status(400).json({message : "'issuerCode' required"});
        return
    }
    if(!reqBody.issuerID){
        res.status(400).json({message : "'issuerID' required"});
        return
    }
    if(!reqBody.organization){
        res.status(400).json({message : "'organization' required"});
        return
    }
    if(!reqBody.organization){
        res.status(400).json({message : "'organization' required"});
        return
    }
    if(!reqBody.identityTypeCodes || reqBody.identityTypeCodes.length === 0 ){
        res.status(400).json({message : "'identityTypeCodes' required. Must have at least 1 identity type code"});
        return
    }

    return issuer.create(reqBody.enrollID, reqBody.issuerID, reqBody.issuerCode, reqBody.organization, reqBody.identityTypeCodes)
     .then(function(enrolledIssuer) {
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
    .catch(function(err) {
        tracing.create('ERROR', 'POST blockchain/issuers', err.stack);
        res.status(500).json({'message':err.stack});
    });
}

exports.create = create;
