const user = require('../models/users.models');
const crypto = require('crypto');

const hash = crypto.randomBytes(16).toString('hex');

exports.register = async function( req, res ) {
    console.log( '\nRequest to create a new user...' );
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country = req.body.country;
    try {
        if (email.indexOf('@') === -1) {
            res.status(400)
                .send("Email must constain @");
        }
        if (password.length === 0) {
            res.status(400)
                .send("Password len cannot be nothing");
        }
        const result = await user.register(name, email, password, city, country  );
        console.log(result);
        if (result === true) {
            res.status(400)
                .send("Email already in use");
        }
        else {
            res.status(200)
                .send({"userid": result});
        }
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