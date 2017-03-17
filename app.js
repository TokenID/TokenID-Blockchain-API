'use strict';

/*******************************************************************************
 * Copyright (c) 2017 TokenID .
 *
 * All rights reserved.
 *
 *******************************************************************************/

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let url = require('url');
let cors = require('cors');
let fs = require('fs');
let path = require('path');
let hfc = require('hfc');
let tracing = require(__dirname + '/server/tools/traces/trace.js');

let configFile = require(__dirname + '/server/configurations/configuration.js');

//Our own modules
let blocks = require(__dirname + '/server/blockchain/blocks/blocks.js');
let block = require(__dirname + '/server/blockchain/blocks/block/block.js');
let identity = require(__dirname + '/server/blockchain/identity/identity.js');
let issuers = require(__dirname + '/server/blockchain/issuers/issuers.js');
let startup = require(__dirname + '/server/configurations/startup/startup.js');
let http = require('http');

const SecurityContext = require(__dirname + '/server/tools/security/securitycontext');

// Object of users' names linked to their security context
let usersToSecurityContext = {};

let port = process.env.VCAP_APP_PORT || configFile.config.appPort;


////////  Pathing and Module Setup  ////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());
app.use(express.static(__dirname + '/Client_Side'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

//===============================================================================================
//    Routing
//===============================================================================================

//-----------------------------------------------------------------------------------------------
//    Blockchain - Identity
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/identity/:providerEnrollmentID', function (req, res, next) {
    identity.create(req, res, next);
});

app.post('/blockchain/identity/initialize/new', function (req, res, next) {
    identity.initialize(req, res, next);
});

app.delete('/blockchain/identity/:providerEnrollmentID/:identityCode', function (req, res, next) {
    identity.delete(req, res, next);
});

app.get('/blockchain/identity/:providerEnrollmentID', function (req, res, next) {
    identity.getIdentities(req, res, next);
});
app.get('/blockchain/identity/:providerEnrollmentID/publicKey', function (req, res, next) {
    identity.getPublicKey(req, res, next);
});

app.get('/blockchain/identity/:providerEnrollmentID/:identityCode', function (req, res, next) {
    identity.getIdentity(req, res, next);
});


//-----------------------------------------------------------------------------------------------
//    Blockchain - Blocks8d55b8daf0
//-----------------------------------------------------------------------------------------------
app.get('/blockchain/blocks', function (req, res, next) {
    blocks.read(req, res, next, usersToSecurityContext);
});

app.get('/blockchain/blocks/:blockNum(\\d+)', function (req, res, next) {
    block.read(req, res, next, usersToSecurityContext);
});

//-----------------------------------------------------------------------------------------------
//    Blockchain - Issuers
//-----------------------------------------------------------------------------------------------
app.post('/blockchain/issuers', function (req, res, next) {
    issuers.create(req, res, next);
});


///////////  Configure Webserver  ///////////
app.use(function (req, res, next) {
    let keys;
    console.log('------------------------------------------ incoming request ------------------------------------------');
    console.log('New ' + req.method + ' request for', req.url);
    let url_parts = url.parse(req.url, true);
    req.parameters = url_parts.query;
    keys = Object.keys(req.parameters);
    if (req.parameters && keys.length > 0) { console.log({ parameters: req.parameters }); }        //print request parameters
    keys = Object.keys(req.body);
    if (req.body && keys.length > 0) { console.log({ body: req.body }); }                        //print request body
    next();
});

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {        // = development error handler, print stack trace
    console.log('Error Handler -', req.url, err);
    let errorCode = err.status || 500;
    res.status(errorCode);
    //res.render('template/error', {bag: req.bag});
    res.send({ 'message': err });
});

// Track the application deployments
require('cf-deployment-tracker-client').track();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_ENV = 'production';
process.env.GOPATH = path.resolve(__dirname, 'Chaincode');

let vcapServices;
let pem;
let server;
let registrar;
let credentials;
let webAppAdminPassword = configFile.config.registrar_password;
if (process.env.VCAP_SERVICES) {
    console.log('\n[!] VCAP_SERVICES detected');
    port = process.env.PORT;
} else {
    port = configFile.config.appPort;
}

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


if (process.env.VCAP_SERVICES) { // We are running in bluemix
    credentials = JSON.parse(process.env.VCAP_SERVICES)['ibm-blockchain-5-prod'][0].credentials;
    console.log('\n[!] Running in bluemix');
    if (!pem) {
        console.log('\n[!] No certificate is available. Will fail to connect to fabric');
    }
    startup.connectToPeers(chain, credentials.peers, pem);
    startup.connectToCA(chain, credentials.ca, pem);
    //startup.connectToEventHub(chain, credentials.peers[0], pem);

    // Get the WebAppAdmins password
    webAppAdminPassword = configFile.config.bluemix_registrar_password;

} else if (pem) { // We are running outside bluemix, connecting to bluemix fabric
    console.log('\n[!] Running locally with bluemix fabric');
    credentials = fs.readFileSync(__dirname + '/credentials.json');
    credentials = JSON.parse(credentials);

    webAppAdminPassword = configFile.config.bluemix_registrar_password;

    startup.connectToPeers(chain, credentials.peers, pem);
    startup.connectToCA(chain, credentials.ca, pem);
    //startup.connectToEventHub(chain, credentials.peers[0], pem);

} else { // We are running locally
    let credentials = fs.readFileSync(__dirname + '/credentials.json');
    credentials = JSON.parse(credentials);
    startup.connectToPeers(chain, credentials.peers);
    startup.connectToCA(chain, credentials.ca);
    //startup.connectToEventHub(chain, credentials.peers[0]);
}
//chain.getEventHub().disconnect();

server = http.createServer(app).listen(port, function () {
    console.log('Server Up');
    tracing.create('INFO', 'Startup complete on port', server.address().port);
});
server.timeout = 2400000;

let demoStatus = {
    status: 'IN_PROGRESS',
    success: false,
    error: null
};

let eventEmitter;
let io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {
    eventEmitter = socket;
    console.log('connected');
    eventEmitter.emit('setup', demoStatus);
});



let chaincodeID;

return startup.enrollRegistrar(chain, configFile.config.registrar_name, webAppAdminPassword)
    .then(function (r) {
        chain.setRegistrar(r);
        tracing.create('INFO', 'Startup', 'Set registrar');
        return startup.loadEnrolledMember(chain, configFile.config.enrollment.name)

    })
    .then(function (member) {
        let sc = new SecurityContext(member);
        //If deployed in bluemix
        configFile.config.certPath = (vcapServices) ? vcapServices.cert_path : configFile.config.certPath;
        configFile.config.securityContext  = sc;

    })
    .catch(function (err) {
        console.log(err);
        tracing.create('ERROR', 'Startup', err);
    });
