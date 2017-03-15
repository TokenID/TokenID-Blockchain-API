'use strict';
const config = require(__dirname+'/../../../../configurations/configuration.js');


let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../tools/utils/util');
let Issuer = require(__dirname+'/../../../../tools/utils/issuer');

function create (req, res, next) {
    user_id = req.session.identity;

    let vehicleData = new Vehicle(usersToSecurityContext);

    return vehicleData.create(user_id)
    .then(function(v5cID) {
        tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Created vehicle');
        let result = {};
        result.message = 'Creation Confirmed';
        result.v5cID = v5cID;
        res.end(JSON.stringify(result));
    })
    .catch(function(err) {
        tracing.create('ERROR', 'POST blockchain/assets/vehicles', err.stack);
        res.send(JSON.stringify({'message':err.stack}));
    });
}

exports.create = create;
