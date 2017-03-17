'use strict';

const Util = require('./util.js');
const configFile = require(__dirname + '/../../configurations/configuration.js');
const startup = require(__dirname + '/../../configurations/startup/startup.js');
const tracing = require(__dirname + '/../../tools/traces/trace.js');
const hfc = require('hfc');
const ursa = require('ursa');
const crypto = require('crypto');

class Identity {

    constructor(securityContext) {
        this.securityContext = securityContext;
        this.chain = hfc.getChain(configFile.config.chainName);
    }
    create(providerEnrollmentID, identityCode, identityTypeCode, identityPayload, issuerID, metaData, attachmentURI) {
        let chain = this.chain;
        let securityContext = this.securityContext;
        return new Promise(function (resolve, reject) {

            Util.queryChaincode(securityContext, 'getPublicKey', [providerEnrollmentID])
                .then(function (data) {
                    let pk = data.toString();
                    tracing.create('INFO', 'Identity', 'Successfully got public Key for ' + providerEnrollmentID)
                    try {
                        let aesKey = crypto.randomBytes(32);
                        let initializationVector = crypto.randomBytes(16);

                        //Encrypt payload
                        let cipher = crypto.createCipheriv('aes-256-cbc', aesKey, initializationVector);
                        let encryptedPayload = cipher.update(JSON.stringify(identityPayload));
                        let encryptedPayloadFinal = cipher.final();
                        //Append IV to encrypted payload and encode in base64 
                        let encryptedPayloadWithIVInBase64 = Buffer.concat([encryptedPayload, encryptedPayloadFinal, initializationVector], encryptedPayload.length + encryptedPayloadFinal.length + initializationVector.length).toString("base64");

                        //Encrypt attachment URI
                        let initializationVector2 = crypto.randomBytes(16);
                        let cipher2 = crypto.createCipheriv('aes-256-cbc', aesKey, initializationVector2);
                        let encryptedAttachmentURI = cipher2.update(attachmentURI);
                        let encryptedAttachmentURIFinal = cipher2.final();

                        //Append IV to encrypted attachmentURI and encode in base64 
                        let encryptedAttachmentURIWithIVInBase64 = Buffer.concat([encryptedAttachmentURI, encryptedAttachmentURIFinal, initializationVector2], encryptedAttachmentURI.length + encryptedAttachmentURIFinal.length + initializationVector2.length).toString("base64");

                        //Encrypt AES Key and encode to base64
                        let publicKey = ursa.createPublicKey(pk);
                        let encryptedKeyBytes = publicKey.encrypt(aesKey)
                        let encryptedKey = new Buffer(encryptedKeyBytes).toString("base64")


                        //Add New Identity on BlockChain
                        Util.invokeChaincode(securityContext, "addIdentity", [providerEnrollmentID, identityCode, identityTypeCode, encryptedPayloadWithIVInBase64, encryptedKey, issuerID, JSON.stringify(metaData), encryptedAttachmentURIWithIVInBase64])
                            .then(function () {
                                tracing.create('INFO', 'Identity', 'New Identity added to BlockChain  -> providerEnrollmentID:' + providerEnrollmentID + " identityCode :" + identityCode);
                                resolve({ message: "Successful" });
                            })
                            .catch(function (err) {
                                tracing.create('ERROR', 'Identity', 'Failed to add Identity on BlockChain -> providerEnrollmentID:' + providerEnrollmentID + " identityCode :" + identityCode + " [" + err.message + "]");
                                console.log(err);
                                reject(err);
                            });
                    }
                    catch (ex) {
                        tracing.create('ERROR', 'Identity', 'Failed to add Identity on BlockChain -> providerEnrollmentID:' + providerEnrollmentID + " identityCode :" + identityCode + " [" + ex.message + "]");
                        console.log(ex);
                        reject(ex);
                    }


                })
                .catch(function (err) {
                    tracing.create('ERROR', 'Identity', 'Failed to add Identity on BlockChain -> providerEnrollmentID:' + providerEnrollmentID + " identityCode :" + identityCode + " [" + err.message + "]");
                    console.log(err);
                    reject(err);
                });
        });
    }

    remove(providerEnrollmentID, identityTypeCode) {
        let chain = this.chain;
        let securityContext = this.securityContext;

        return new Promise(function (resolve, reject) {
            Util.invokeChaincode(securityContext, 'removeIdentity', [providerEnrollmentID, identityTypeCode])
                .then(function (data) {
                    let pk = data.toString();
                    console.log(pk);
                    tracing.create('INFO', 'Identity', 'Identity removed -> ' + providerEnrollmentID + '/' + identityTypeCode);
                    let result = {};
                    result.message = 'Identity succesfully deleted';
                    resolve(result);
                })
                .catch(function (err) {
                    let error = {};
                    error.error = true;
                    error.message = err;
                    tracing.create('INFO', 'Identity', 'Failed to remove identity -> ' + providerEnrollmentID + '/' + identityTypeCode, err);
                    console.log(err)
                    resolve(error)
                });
        });
    }

    initialize(providerEnrollmentID, publicKey) {
        let chain = this.chain;
        let securityContext = this.securityContext;

        return new Promise(function (resolve, reject) {
            // ChainCode deployment for the Identity
            startup.deployChaincode(securityContext.getEnrolledMember, configFile.config.identityChainCodeUrl, "init", [providerEnrollmentID, publicKey], configFile.config.certPath)
                .then(function (result) {
                    let chaincodeID = result.chaincodeID
                    securityContext.setChaincodeID(chaincodeID)
                    //Register New Identity on BlockChain
                    Util.invokeChaincode(securityContext, "initIdentity", [providerEnrollmentID, publicKey])
                        .then(function () {
                            tracing.create('INFO', 'Identity', 'Identity registered on BlockChain ' + providerEnrollmentID);
                            resolve({ message: "Identity successfully registered", "chaincodeID" : chaincodeID });
                        })
                        .catch(function (err) {
                            tracing.create('ERROR', 'Identity', 'Failed to register Identity on BlockChain ' + providerEnrollmentID);
                            console.log(err);
                            reject(err);
                        });

                })




        });
    }
}

module.exports = Identity;
