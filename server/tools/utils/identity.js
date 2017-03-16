'use strict';

const Util = require('./util.js');
const configFile = require(__dirname + '/../../configurations/configuration.js');
const tracing = require(__dirname + '/../../tools/traces/trace.js');
const hfc = require('hfc');
const ursa = require('ursa');
const crypto = require('crypto');

class Identity {

    constructor(securityContext) {
        this.securityContext = securityContext;
        this.chain = hfc.getChain(configFile.config.chainName);
    }
    create(providerEnrollmentID, identityCode, identityTypeCode, identityPayload, encryptionKey, issuerID, metaData, attachmentURI) {
        return new Promise(function (resolve, reject) {

            Util.queryChaincode(securityContext, 'getPublicKey', [req.params.providerEnrollmentID])
                .then(function (data) {
                    let pk = data.toString();
                    tracing.create('INFO', 'Identity', 'Successfully got public Key for ' + providerEnrollmentID)
                    try {
                        let aesKey = crypto.randomBytes(32);
                        let initializationVector = crypto.randomBytes(32);

                        //Encrypt payload
                        let cipher = crypto.createCipheriv('aes-256-cbc', aesKey, initializationVector);
                        cipher.update(JSON.stringify(identityPayload));
                        let encryptedPayload = cipher.final();
                        //Append IV to encrypted payload and encode in base64 
                        let encryptedPayloadWithIVInBase64 = Buffer.concat([encryptedPayload, initializationVector], encryptedPayload.length + initializationVector.length).toString("base64");

                        //Encrypt attachment URI
                        let initializationVector2 = crypto.randomBytes(32);
                        let cipher2 = crypto.createCipheriv('aes-256-cbc', aesKey, initializationVector2);
                        cipher2.update(attachmentURI);
                        let encryptedAttachmentURI = cipher2.final();

                        //Append IV to encrypted attachmentURI and encode in base64 
                        let encryptedAttachmentURIWithIVInBase64 = Buffer.concat([encryptedAttachmentURI, initializationVector2], encryptedAttachmentURI.length + initializationVector2.length).toString("base64");

                        //Encrypt AES Key and encode to base64
                        let publicKey = ursa.createPublicKey(pek);
                        let encryptedKey = Buffer.from(publicKey.encrypt(aesKey)).toString("base64")


                        //Add New Identity on BlockChain
                        Util.invokeChaincode(securityContext, "addIdentity", [providerEnrollmentID, identityCode, identityTypeCode, encryptedPayloadWithIVInBase64, encryptionKey, issuerID, metaData, encryptedAttachmentURIWithIVInBase64])
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
                        reject(err);
                    }


                })
                .catch(function (err) {
                    tracing.create('ERROR', 'Identity', 'Failed to add Identity on BlockChain -> providerEnrollmentID:' + providerEnrollmentID + " identityCode :" + identityCode + " [" + err.message + "]");
                    console.log(err);
                    reject(err);
                });
        });
    }

    initialize(providerEnrollmentID, publicKey) {
        let chain = this.chain;
        let securityContext = this.securityContext;

        return new Promise(function (resolve, reject) {
            //TODO: Include chain deployment for the User

            //Register New Identity on BlockChain
            Util.invokeChaincode(securityContext, "initIdentity", [providerEnrollmentID, publicKey])
                .then(function () {
                    tracing.create('INFO', 'Identity', 'Identity registered on BlockChain ' + providerEnrollmentID);
                    resolve({ message: "Successful" });
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
