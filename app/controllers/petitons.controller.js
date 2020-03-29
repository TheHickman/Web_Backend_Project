const petitions = require('../models/petition.models');
const fs = require('mz/fs')
var mime = require('mime-types')
const path = require('path')

exports.lister = async function( req, res ) {
    const q = req.query.q;
    const categoryId = req.query.categoryId;
    const authorId = req.query.authorId;
    const sortBy = req.query.sortBy;
    let count = (req.query.count);
    let startIndex = (req.query.startIndex);
    if (authorId != null) {
        if (isNaN(authorId)) {
            res.status(400)
                .send();
        }
    }

    if (startIndex != null) {
        if (isNaN(startIndex) == true) {
            res.status(400)
                .send();
        }
    }
    if (count != null) {
        if (isNaN(count) == true) {
            res.status(400)
                .send();
        }
    }
    count = parseInt(count);
    startIndex = parseInt(startIndex);
    if (isNaN(startIndex) == true) {
        startIndex = 0;
    }
    if (categoryId != null) {
        if (categoryId > 7 || categoryId < 0 || categoryId.length == 0 || isNaN(categoryId)) {
            res.status(400)
                .send();
        }
    }
    if (sortBy != null) {
        if (sortBy != "ALPHABETICAL_ASC" && sortBy != "ALPHABETICAL_DESC" && sortBy != "SIGNATURES_ASC" && sortBy != "SIGNATURES_DESC") {
            res.status(400)
                .send();
        }
    }
    const endIndex = startIndex + count;
    try {
        const result = await petitions.list(q, categoryId, authorId, sortBy);
        if (isNaN(count) == false) {
            res.status(200)
                .send(result.slice(startIndex, endIndex));
        }
        else if (isNaN(count) == true) {
            res.status(200)
                .send(result.slice(startIndex));
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting users ${ err }` );
    }
};

exports.create = async function(req, res){
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;
    if (title == null|| categoryId == null || description == null || closingDate == null) {
        res.status(400)
            .send();
    }
    if (categoryId != null) {
        if (categoryId > 7 || categoryId < 0 || categoryId.length == 0 || isNaN(categoryId)) {
            res.status(400)
                .send();
        }
    }
    let now = new Date();
    if (closingDate != null) {
        let date = new Date(closingDate);
        if (date < now || isNaN(date)) {
            res.status(400)
                .send("NoNoNo");
        }
    }
    try {
        const auth_token = req.headers['x-authorization'];
        const result = await petitions.insert(auth_token, title, description, categoryId, now, closingDate);
        if (result == 66) {
            res.status(401)
                .send("Wrong user");
        }
        res.status(201)
            .send({"petitionId" : result});
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.read = async function(req, res){
    const pet_id = req.params.id;
    try {
        const result = await petitions.read(pet_id);
        if (result.length != 0) {
            res.status(200)
                .send(result[0]);
        }
        if (result.length == 0) {
            res.status(404)
                .send("No result");
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};
exports.update = async function(req, res){
    const auth_token = req.headers['x-authorization'];
    if (auth_token == null) {
        res.status(401)
            .send("Toekn is invalid");
    }
    let now = new Date();
    const pet_id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;
    if (title == null && description == null && categoryId == null && closingDate == null) {
        res.status(400)
            .send("No changes");
    }
    if (closingDate != null) {
        let date = new Date(closingDate);
        if (date < now) {
            res.status(400)
                .send("NoNoNo");
        }
    }
    if (categoryId != null) {
        if (categoryId > 7 || categoryId < 0 || categoryId.length == 0 || isNaN(categoryId)) {
            res.status(400)
                .send();
        }
    }
    try {
        const result = await petitions.alter(pet_id, auth_token, title, description, categoryId, closingDate);
        if (result == "Not allowed") {
            res.status(400)
                .send("Future");
        }
        if (result == "Token bad") {
            res.status(401)
                .send("No");
        }
        if (result == "Not yours") {
            res.status(403)
                .send("Not your petition");
        }
        if (result == "Not found") {
            res.status(404)
                .send("Petition not found");
        }
        res.status(200)
            .send();
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }

};

exports.delete = async function(req, res){
    const pet_id = req.params.id;
    const auth_token = req.headers['x-authorization'];
    try {
        const result = await petitions.remove(pet_id, auth_token);
        if (result == "Token bad") {
            res.status(401)
                .send("Unauthorised");
        }
        if (result == "Not yours") {
            res.status(403)
                .send("Forbidden");
        }
        if (result == "Not found") {
            res.status(404)
                .send("Not found");
        }
        res.status(200)
            .send();
    } catch (err) {
        res.status(500)
            .send();
    }
};

exports.getCatInfo = async function(req, res){
    try {
        const result = await petitions.listcats();
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getSigs = async function(req, res) {
    const pet_id = req.params.id;
    try {
        const result = await petitions.getSigs(pet_id);
        if (result.length == 0) {
            res.status(404)
                .send("Petition not found");
        }
        res.status(200)
            .send(result);

    } catch (err) {
        res.status(500)
            .send("Internal Server Error")
    }
};

exports.postSigs = async function(req, res) {
    const auth_token = req.headers['x-authorization'];
    const pet_id = req.params.id;
    try {
        const result = await petitions.postSigs(auth_token, pet_id);
        if (result == 401) {
            res.status(401)
                .send("Unauthorised");
        }
        if (result == 403) {
            res.status(403)
                .send("Forbidden");
        }
        if (result == 404) {
            res.status(404)
                .send("Not found");
        }
        if (result == true) {
            res.status(201)
                .send("Created");
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
    return null;
};

exports.removeSigs = async function(req, res) {
    const auth_token = req.headers['x-authorization'];
    const pet_id = req.params.id;
    try {
        const result = await petitions.removeSigs(auth_token, pet_id);
        if (result == 200) {
            res.status(200)
                .send("OK");
        }
        if (result == 401) {
            res.status(401)
                .send("Unauthorised");
        }
        if (result == 403) {
            res.status(403)
                .send("forbidden");
        }
        if (result == 404) {
            res.status(404)
                .send("Not fund");
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getPhoto = async function (req, res) {
    const pet_id = req.params.id;
    try {
        const result = await petitions.getPhoto(pet_id);
        if (result == 404) {
            res.status(404)
                .send("Not found");
        }
        if (await fs.exists('./storage/photos/' + result)) {
            const image = await fs.readFile('./storage/photos/' + result);
            const mimeType = mime.lookup('./storage/photos/' + result)
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
            .send("Internal Server Error");
    }
};

exports.putPhoto = async function(req, res) {
    const auth_token = req.headers['x-authorization'];
    const pet_id = req.params.id;
    const mime_type = req.headers['content-type'];
    let extension = mime.extension(mime_type);
    if (extension != 'jpeg' && extension != 'png' && extension != 'gif') {
        res.status(400)
            .send("bad requet");
    }
    if (extension == 'jpeg') {
        extension = 'jpg';
    }
    try {
        const file_name = pet_id + '.' + extension;
        const result = await petitions.postPhoto(auth_token, pet_id, file_name);
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
            strean.close();
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
};