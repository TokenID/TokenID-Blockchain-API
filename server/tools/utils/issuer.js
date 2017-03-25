'use strict';

const Util = require('./util.js');
const configFile = require(__dirname + '/../../configurations/configuration.js');
const tracing = require(__dirname + '/../../tools/traces/trace.js');
const hfc = require('hfc');

class Issuer {

    constructor(securityContext) {
        this.securityContext = securityContext;
        this.chain = hfc.getChain(configFile.config.chainName);
    }

    create(enrollID, issuerID, issuerCode, organization, identityTypeCodes) {
        let regRequest = {};
        let chain = this.chain;
        let securityContext = this.securityContext;
        regRequest.enrollmentID = enrollID
        regRequest.affiliation = "group1" //TODO: change this value(group1).Only set for bluemix 
        regRequest.attributes = [
            { name: 'role', value: 'Issuer' },
            { name: 'username', value: enrollID },
            { name: 'issuerCode', value: issuerCode },
            { name: 'issuerID', value: issuerID },
            {name : 'identityTypeCodes' ,  value :   identityTypeCodes.join()},
            { name: 'organization', value: organization }
        ];
        return new Promise(function (resolve, reject) {
            return chain.registerAndEnroll(regRequest, function (err, enrolledUser) {
                if (!err) {
                    tracing.create('INFO', 'Issuer', 'Registrar enroll worked with user ' + regRequest.enrollmentID);
                    tracing.create('INFO', 'Issuer', 'Issuer registered on BlockChain ' + issuerID);
                    resolve(enrolledUser);

                }
                else {
                    tracing.create('INFO', 'Startup', 'Failed to enroll ' + regRequest.enrollmentID + ' using HFC. Error: ' + JSON.stringify(err));
                    console.log(err);
                    reject(err);
                }
            });
        });
    }
}

module.exports = Issuer;
