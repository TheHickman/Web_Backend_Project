const user = require('../models/petition.models');

exports.list = async function( req, res ) {
    console.log( '\nRequest to list petitions...' );
    const startIndex = req.param.startIndex;
    const count = req.param.count;
    const q = req.param.q;
    const categoryId = req.param.categoryId;
    const authorId = req.param.authorId;
    const sortBy = req.param.sortBy;
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