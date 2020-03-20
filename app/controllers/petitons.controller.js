const petitions = require('../models/petition.models');

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
    const createdDate = now.toISOString().substring(0, 10) + " " + now.toISOString().substring(11, 23);
    try {
        const auth_token = req.headers['x-authorization'];
        const result = await petitions.insert(auth_token, title, description, categoryId, createdDate, closingDate);
        if (result == false) {
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
    return null;
};
exports.delete = async function(req, res){
    return null;
};
exports.list = async function(req, res){
    return null;
};