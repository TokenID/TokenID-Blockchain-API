'use strict';

const Util = require('./util.js');
const configFile = require(__dirname + '/../../configurations/configuration.js');
const tracing = require(__dirname + '/../../tools/traces/trace.js');
const hfc = require('hfc');

class Identity {

    constructor(securityContext) {
        this.securityContext = securityContext;
        this.chain = hfc.getChain(configFile.config.chainName);
    }
    create(ProviderEnrollmentID, IdentityCode, IdentityTypeCode, EncryptedIdentityPayload, EncryptionKey, IssuerID, MetaData, EncryptedAttachmentURI) {
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
            { name: 'organization', value: organization }
        ];
        return new Promise(function (resolve, reject) {
            return chain.registerAndEnroll(regRequest, function (err, enrolledUser) {
                if (!err) {
                    tracing.create('INFO', 'Issuer', 'Registrar enroll worked with user ' + regRequest.enrollmentID);
                    //Register Issuer on BlockChain
                    Util.invokeChaincode(securityContext, "initIssuer", [enrollID, issuerID, issuerCode, organization, identityCodes.toString()])
                        .then(function () {
                            tracing.create('INFO', 'Issuer', 'Issuer registered on BlockChain ' + issuerID);
                            resolve(enrolledUser);
                        })
                        .catch(function (err) {
                            tracing.create('ERROR', 'Issuer', 'Failed to register issuer on BlockChain ' + issuerID);
                            console.log(err);
                            reject(err);
                        });

                }
                else {
                    tracing.create('INFO', 'Startup', 'Failed to enroll ' + regRequest.enrollmentID + ' using HFC. Error: ' + JSON.stringify(err));
                    console.log(err);
                    reject(err);
                }
            });
        });
    }

    initialize(providerEnrollmentID, publicKey) {
        let regRequest = {};
        let chain = this.chain;
        let securityContext = this.securityContext;

        return new Promise(function (resolve, reject) {
            //TODO: Include chain deployment for the User

            //Register New Identity on BlockChain
            Util.invokeChaincode(securityContext, "initIdentity", [providerEnrollmentID, publicKey])
                .then(function () {
                    tracing.create('INFO', 'Identity', 'Identity registered on BlockChain ' + providerEnrollmentID);
                    resolve({message : "Successful"});
                })
                .catch(function (err) {
                    tracing.create('ERROR', 'Identity', 'Failed to register Identity on BlockChain ' + providerEnrollmentID);
                    console.log(err);
                    reject(err);
                });
       



        });
    }
}

module.exports = Identity;
