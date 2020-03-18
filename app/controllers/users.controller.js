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
        if (name.length === 0) {
            res.status(400)
                .send("Name missing");
        }
        const result = await user.register(name, email, password, city, country  );
        if (result === true) {
            res.status(400)
                .send("Email already in use");
        }
        else {
            res.status(201)
                .send({"userid": result});
        }
    } catch( err ) {
        res.status( 500 )
            .send( "Internal Server Error");
    }
};

exports.login = async function(req, res){
    try {
        const email = req.body.email;
        const password = req.body.password;
        const result = await user.login(email, password);
        if (result === false) {
            res.status(400)
                .send("Invaid Email or Password");
        }
        res.status(200)
            .send(result);
    } catch(err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.logout = async function(req, res){
    try {
        const auth_token = req.headers['x-authorization'];
        const result = await user.logout(auth_token);
        if (result == true) {
            res.status(401)
                .send("Unauthorised")
        }
        res.status(200)
            .send("Logged out yeet");
        } catch (err) {
            res.status(500)
                .send("Internal Server Error");
    }
};

exports.retrieve = async function(req, res){
    try {
        const auth_token = req.headers['x-authorisation'];
        const user_id = req.params.id;
        const result = await user.retrieve(user_id, auth_token);
        if (result != null) {
            res.status(200)
                .send(result[0][0]);
        }
        else {
            res.status(404)
                .send("Not found")
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error")
    }
};

exports.update = async function(req, res){
    try {
        const auth_token = req.headers['x-authorisation'];
        const current_password = req.params.currentPassword;
        const user_id = req.params.id;
        const new_password = req.params.password;
        const city = req.params.city;
        const country = req.params.country;

        const result = await user.retrieve(auth_token, user_id, current_password, new_password);
    } catch (err) {
        res.status(500)
            .send("Internal Server Error")
    }
};