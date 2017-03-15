'use strict';

let fs = require('fs');
let KeyEncoder = require("key-encoder")
let keyEncoder = new KeyEncoder("secp256k1")

//TODO: Change this a be compatible with the Config npm module

let config = {};

config = JSON.parse(fs.readFileSync(__dirname + '/../../config.json', 'utf8'));

//--------------------------------------------------------------------------------------------------------------------
//   Load Enrollment credentials
//--------------------------------------------------------------------------------------------------------------------
let enrollment = JSON.parse(fs.readFileSync(__dirname + '/../../enrollment.json', 'utf8'));

if(enrollment)
{
    //Write enrollment to keyValueStore
    fs.writeFile(__dirname + '/../../member.' + enrollment.name, JSON.stringify(enrollment), function(err){
        if(!err)
        {
            config.enrollment =  enrollment;
            console.log("Enrollment details loaded");
        }
        else{
             console.error("Could not load enrollment details - " + err);
        }
    })
    
    
}


//--------------------------------------------------------------------------------------------------------------------
//    Local Config -
//--------------------------------------------------------------------------------------------------------------------
//config.networkProtocol = 'https';                 // If deploying locally, this value needs to be changed to 'http'
//config.appProtocol = 'https';                     // If deploying locally, this value needs to be changed to 'http'
//config.hfcProtocol = 'grpcs';                    // If deploying locally, this value needs to be changed to 'grpc'

//--------------------------------------------------------------------------------------------------------------------
//    Tracing
//--------------------------------------------------------------------------------------------------------------------

//config.trace        = true;
config.traceFile    = __dirname+'/../../'+ config.traceFile ;     // File where traces should be written to


//Settings for the nodeJS application server
//config.offlineUrl = 'localhost';
config.appPort = (parseInt(process.env.PORT)) ? parseInt(process.env.PORT) : config.appPort;                         //Port that the NodeJS server is operating on


//--------------------------------------------------------------------------------------------------------------------
//    User information - These credentials are used for HFC to enroll this user and then set them as the registrar to create new users.
//--------------------------------------------------------------------------------------------------------------------
config.registrar_name = 'admin';
config.registrar_password = 'd3136c4a5d';

//--------------------------------------------------------------------------------------------------------------------
//    HFC configuration - Defines what protocol to use for communication, bluemix certificate location and key store location
//--------------------------------------------------------------------------------------------------------------------

//Protocol used by HFC to communicate with blockchain peers and CA, need to change this manually.
config.certificateFileName    = 'us.blockchain.ibm.com.cert'; //TLSCert
config.keyStoreLocation       = './keyValStore';

//--------------------------------------------------------------------------------------------------------------------
//    Chaincode
//--------------------------------------------------------------------------------------------------------------------
//Chaincode file location
config.vehicle = 'github.com/hyperledger/fabric/vehicle_code';
config.users = [
    {
        enrollmentID: 'provider_5',
        attributes: [
            {name: 'role', value: 'Provider'},
            {name: 'username', value: 'provider_5'},
            {name: 'issuerCode', value: ''},
            {name: 'issuerID', value: ''},
            {name: 'organization', value: '' }
        ],
        registrar: {},
        roles: [],
        affiliation: 'institution_a'
    }
]

// config.users = [
//      {
//         enrollmentID: 'bank_provider2',
//         attributes: [
//             {name: 'role', value: 'Provider'},
//             {name: 'username', value: 'bank_provider2'},
//             {name: 'issuerCode', value: ''},
//             {name: 'issuerID', value: ''},
//             {name: 'organization', value: '' }
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },
//     {
//         enrollmentID: 'spectranet_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'spectranet_user'},
//             {name: 'issuerCode', value: 'SPCTR'},
//             {name: 'issuerID', value: 'ISS-123442111'},
//             {name: 'organization', value: 'Spectranet LTD'}  
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },
//     {
//         enrollmentID: 'spectranet_user_2',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'spectranet_user_2'},
//             {name: 'issuerCode', value: 'SPCTR'},
//             {name: 'issuerID', value: 'ISS-123442111'},
//             {name: 'organization', value: 'Spectranet LTD'}  
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },

//     {
//         enrollmentID: 'vemco_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'vemco_user'},
//             {name: 'issuerCode', value: 'VEMCO'},
//             {name: 'issuerID', value: 'ISS-4453737377'},
//             {name: 'organization', value: 'VEMCO Insurance LTD'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },
//     {
//         enrollmentID: 'firs_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'firs_user'},
//             {name: 'issuerCode', value: 'FIRS'},
//             {name: 'issuerID', value: 'ISS-2233485958494'},
//             {name: 'organization', value: 'Federal Internal Revenue Service'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },

//     {
//         enrollmentID: 'ican_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'ican_user'},
//             {name: 'issuerCode', value: 'ICAN'},
//             {name: 'issuerID', value: 'ISS-22232222144'},
//             {name: 'organization', value: 'Institute of Chartered Accountants'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },
//     {
//         enrollmentID: 'nurtw_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'nurtw_user'},
//             {name: 'issuerCode', value: 'NURTW'},
//             {name: 'issuerID', value: 'ISS-55372722744'},
//             {name: 'organization', value: 'National Union of Road Transport Workers'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },
//     {
//         enrollmentID: 'nut_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'nut_user'},
//             {name: 'issuerCode', value: 'NUT'},
//             {name: 'issuerID', value: 'ISS-0023342111'},
//             {name: 'organization', value: 'National Union of Teachers'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },

//     {
//         enrollmentID: 'uniben_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'uniben_user'},
//             {name: 'issuerCode', value: 'UNIBEN'},
//             {name: 'issuerID', value: 'ISS-23442112344'},
//             {name: 'organization', value: 'University of Benin'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },

//      {
//         enrollmentID: 'nimc_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'nimc_user'},
//             {name: 'issuerCode', value: 'NIMC'},
//             {name: 'issuerID', value: 'ISS-341122332111'},
//             {name: 'organization', value: 'National Identity Management Commission'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },

//     {
//         enrollmentID: 'inec_user',
//         attributes: [
//             {name: 'role', value: 'Issuer'},
//             {name: 'username', value: 'inec_user'},
//             {name: 'issuerCode', value: 'INEC'},
//             {name: 'issuerID', value: 'ISS-5512233321'},
//             {name: 'organization', value: ' Independent National Electoral Commission'}
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },


//     {
//         enrollmentID: 'bank_provider',
//         attributes: [
//             {name: 'role', value: 'Provider'},
//             {name: 'username', value: 'bank_provider'},
//             {name: 'issuerCode', value: ''},
//             {name: 'issuerID', value: ''},
//             {name: 'organization', value: '' }
//         ],
//         registrar: {},
//         roles: [],
//         affiliation: 'institution_a'
//     },
    
    
// ];

//--------------------------------------------------------------------------------------------------------------------
//    Defines the exported values to be used by other fields for connecting to peers or the app. These will be overwritten on app.js being run if Bluemix is being used or Network JSON is defined
//--------------------------------------------------------------------------------------------------------------------
//IP and port configuration
// config.api_ip = config.peers[0].discovery_host; //IP of the peer attempting to be connected to. By default this is the first peer in the peers array.
let credentials;

if (process.env.VCAP_SERVICES) {
    credentials = JSON.parse(process.env.VCAP_SERVICES)['ibm-blockchain-5-prod'][0].credentials;
} else {
    credentials = fs.readFileSync(__dirname + '/../../credentials.json', 'utf8');
    credentials = JSON.parse(credentials);
}

//When using blockchain on bluemix, api_port_external and api_port_internal will be the same
config.api_port_external  = credentials.peers[0].api_port; //port number used when calling api from outside of the vagrant environment
config.api_port_internal  = credentials.peers[0].discovery_port; //port number used when calling api from inside vagrant environment - generally used for chaincode calling out to api
config.api_port_discovery = credentials.peers[0].discovery_port; //port number used for HFC

config.api_ip = credentials.peers[0].discovery_host;

let ca;
for(let key in credentials.ca) {
    ca = credentials.ca[key];
}

//IP and port configuration for the Certificate Authority. This is used for enrolling WebAppAdmin and creating all the user via HFC. Default values are for running Hyperledger locally.
config.ca_ip = ca.discovery_host;     //IP of the CA attempting to be connected to
config.ca_port = ca.discovery_port;         //Discovery port of the Certificate Authority. Used for HFC

if (credentials.users) {
    credentials.users.forEach(function(user) {
        if (user.username === config.registrar_name) {
            config.bluemix_registrar_password = user.secret;
        }
    });
}

config.chainName = "clientChain"

exports.config = config; // Exports for use in other files that require this one
