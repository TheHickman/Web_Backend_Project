const petitions = require('../models/petition.models');

exports.lister = async function( req, res ) {
    console.log("Here")
    const start_index = req.params.startIndex;
    const count = req.params.count;
    const q = req.params.q;
    const categoryId = req.params.categoryId;
    const authorId = req.params.authorId;
    const sortBy = req.params.sortBy;
    try {
        const result = await petitions.list(q, categoryId, authorId, sortBy);
        res.status( 200 )
            .send(result);
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting users ${ err }` );
    }
};

exports.create = async function(req, res){
    return null;
};
exports.read = async function(req, res){
    return null;
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