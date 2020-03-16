const user = require('../models/users.model');
const crypto = require('crypto');

const hash = crypto.randomBytes(16).toString('hex');

exports.create = async function( req, res ) {
    console.log( '\nRequest to create a new user...' );
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country = req.body.country;
    try {
        const result = await user.insert(  );
        res.status( 200 )
            .send( 'User created!' );
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR creating user ${ err }` );
    }
};

exports.login = async function(req, res){
    return null;
};

exports.logout = async function(req, res){
    return null;
};

exports.retrieve = async function(req, res){
    return null;
};

exports.update = async function(req, res){
    return null;
};