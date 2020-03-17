const user = require('../models/petition.models');

exports.list = async function( req, res ) {
    console.log( '\nRequest to list petitions...' );
    const startIndex = req.params.startIndex;
    const count = req.params.count;
    const q = req.params.q;
    const categoryId = req.params.categoryId;
    const authorId = req.params.authorId;
    const sortBy = req.params.sortBy;
    try {
        const result = await user.getAll();
        res.status( 200 )
            .send( result );
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