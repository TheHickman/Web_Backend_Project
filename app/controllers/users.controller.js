const user = require('../models/users.models');
const crypto = require('crypto');
const fs = require('mz/fs')
var mime = require('mime-types')
const path = require('path')

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
        if (name == null) {
            res.status(400)
                .send("Name len is 0");
        }
        const result = await user.register(name, email, password, city, country  );
        if (result == 400) {
            res.status(400)
                .send("Email already in use");
        }
        else {
            res.status(201)
                .send({"userId": result});
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
        if (email.indexOf('@') === -1) {
            res.status(400)
                .send("Invalid Email or Passowrd");
        }
        const result = await user.login(email, password);
        if (result === 400) {
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
        if (result == 401) {
            res.status(401)
                .send("Unauthorised")
        }
        res.status(200)
            .send("Logged out");
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
        if (result != false) {
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
        const auth_token = req.headers['x-authorization'];
        const user_id = req.params.id;
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.currentPassword;
        const new_password = req.body.password;
        const city = req.body.city;
        const country = req.body.country;
        if (name == null && email == null && new_password == null && city == null && country == null) {
            res.status(400)
                .send("No changes");
        }
        if (password == null || new_password == null) {
            res.status(400)
                .send("No password");
        }
        if (email != null && email.indexOf("@") == -1) {
            res.status(400)
                .send("Invalid email");
        }
        if (auth_token == null) {
            res.status(401)
                .send("Toekn is invalid");
        }
        const result = await user.update(auth_token, user_id, name, email, password, new_password, city, country);
        if (result == 401) {
            res.status(401)
                .send("Not allowed");
        }
        if (result == 400) {
            res.status(400)
                .send("Email in use");
        }
        if (result == 403) {
            res.status(403)
                .send("Wrong user");
        }
        res.status(200)
            .send("OK");
    } catch (err) {
        res.status(500)
            .send("Internal Server Error")
    }
};

exports.getPhoto = async function(req, res) {
    try {
        const user_id = req.params.id;
        const result = await user.getPhoto(user_id);
        if (result == 404 || result == null) {
            res.status(404)
                .send("Cannot find");
        }
        if (await fs.exists('./storage/photos/' + result)) {
            const image = await fs.readFile('./storage/photos/' + result);
            const mimeType = mime.lookup('./storage/photos/' + result);
            const image_dict = {image, mimeType};
            res.status(200)
                .contentType(image_dict.mimeType).send(image_dict.image);
        }
        else {
            res.status(404)
                .send("Image file not in folder");
        }
    } catch (err) {
        res.status(500)
            .send("Internal server error")
    }
};

exports.putPhoto = async function(req, res) {
    const mime_type = req.headers['content-type'];
    let extension = mime.extension(mime_type);
    if (extension == 'jpeg') {
        extension = 'jpg';
    }
    if (extension != 'jpg' && extension != 'png' && extension != 'gif') {
        res.status(400)
            .send("bad request");
    }
    else {
        try {
            const auth_token = req.headers['x-authorization'];
            const userId = req.params.id;
            const file_name = userId + '.' + extension;
            const result = await user.putPhoto(userId, auth_token, file_name);
            if (result == 404) {
                res.status(404)
                    .send("not found");
            }
            if (result == 403) {
                res.status(403)
                    .send("Forbiden");
            }
            if (result == 401) {
                res.status(401)
                    .send("Unauthorised")
            }
            if (result == 200 || result == 201) {
                const file_path = path.dirname(require.main.filename) + '/storage/photos/';
                const stream = fs.createWriteStream(file_path + file_name);
                req.pipe(stream);
                stream.end();
                if (result == 200) {
                    res.status(200)
                        .send("OK");
                }
                if (result == 201) {
                    res.status(201)
                        .send("created");
                }
            }
        } catch (err) {
            res.status(500)
                .send("Internal Server Error");
        }
    }
};

exports.deletePhoto = async function(req, res) {
    try {
        const auth_token = req.headers['x-authorization'];
        const userId = req.params.id;
        const result = await user.removePhoto(userId, auth_token);
        if (result == 404) {
            res.status(404)
                .send("not found");
        }
        if (result == 403) {
            res.status(403)
                .send("Forbiden");
        }
        if (result == 401) {
            res.status(401)
                .send("Unauthorised")
        }
        else {
            const file_path = path.dirname(require.main.filename) + '/storage/photos/';
            fs.unlink(file_path + result)
            res.status(200)
                .send("OK")
        }
    }catch(err) {
        res.status(500)
            .send("Internal Server Error");
    }
};