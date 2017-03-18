'use strict'
let hfc = require('hfc');
let express = require("express")
let fs = require("fs")
let http = require("http");
let app = express();
let tracing = require(__dirname + '/server/tools/traces/trace.js');
let startup = require(__dirname + '/server/configurations/startup/startup.js');
let configFile = require(__dirname + '/server/configurations/configuration.js');

let pem = "";

let server = http.createServer(app).listen(8000, function () {
    console.log('Server Up');
    tracing.create('INFO', 'Startup complete on port', server.address().port);
});
server.timeout = 2400000;
let q  = {};
let c = decodeURIComponent("-----BEGIN%20PUBLIC%20KEY-----%0AMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqvxGELxbe3m0kGNsFjEE%0A1oTTOnDtCo7d7wPX1nmyszSHSfEydf1WZHyqczp2pSE%2B%2BeN1HKdfCc4RAxvGVp%2FC%0A1gYFwietuaPrtJdEH41q%2BMR%2BIkOMEHeLkkBlcdhnQIUlLa%2FxT3K92pF1mqpej6Lb%0AK%2Bx0hVUEX1k%2BzbGzjbskhl11S0o2f6bQ7Xcar8Qr6JbXPf8QdYU1EdnAaHmvM%2Bei%0AstW9NM8L2B%2B0r4DW81DPHdeOuULyZCysBXDN3ijuT4W5ytwroBJsWC2HGJLK0VWs%0AFp3fhSGg0bQ%2Bfv5bnLa77dH5i6Aahul2J%2FDGazQF969rGGa4WGuiQZu%2BI0aF3l3j%0ALQIDAQAB%0A-----END%20PUBLIC%20KEY-----")
q.c = c;
let z = JSON.stringify(q);
// Setup HFC
let chain = hfc.newChain(configFile.config.chainName);
//This is the location of the key store HFC will use. If running locally, this directory must exist on your machine
chain.setKeyValStore(hfc.newFileKeyValStore(configFile.config.keyStoreLocation));

//TODO: Change this to be a boolean stating if ssl is enabled or disabled
//Retrieve the certificate if grpcs is being used
if (configFile.config.hfcProtocol === 'grpcs') {
    chain.setECDSAModeForGRPC(true);
    pem = fs.readFileSync(__dirname + '/' + configFile.config.certificateFileName, 'utf8');
}
let credentials = fs.readFileSync(__dirname + '/util_credentials.json');
credentials = JSON.parse(credentials);
console.log(pem)
startup.connectToPeers(chain, credentials.peers, pem);
startup.connectToCA(chain, credentials.ca, pem);

let regName = "WebAppAdmin"
let regPasswd = "01fe462f77"

let users = [
    {
        enrollmentID: 'provider_12',
        attributes: [
            { name: 'role', value: 'Provider' },
            { name: 'username', value: 'provider_6' },
            { name: 'issuerCode', value: '' },
            { name: 'issuerID', value: '' },
            { name: 'organization', value: '' }
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    }
]
return startup.enrollRegistrar(chain, regName, regPasswd)
    .then(function (r) {
        let registrar = r;
        chain.setRegistrar(registrar);
        tracing.create('INFO', 'Startup', 'Set registrar');
        if (pem) {
            users.forEach(function (user) {
                user.affiliation = 'group1';
            });
        }
        return startup.enrollUsers(chain, users, registrar);
    })
    .then(function (users) {

        let x = [];
        users.forEach(function (enrolledIssuer) {
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
            x.push(result.issuer);
        })
        tracing.create('INFO', 'Startup', 'All users registered');

        fs.writeFileSync("enrollment2.json", JSON.stringify(x));

    })
