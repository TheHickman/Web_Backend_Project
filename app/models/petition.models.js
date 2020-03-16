const db = require('../../config/db');


exports.getAll = async function( ) {
    console.log( 'Request to get all petitions from the database...' );
    const conn = await db.getPool().getConnection();
    const query = 'select Signature.petition_id as petitionId, title, Category.name as category, User.name as authorName, count(Signature.petition_id) as signatureCount from Signature JOIN Petition on Signature.petition_id = Petition.petition_id JOIN Category on Petition.category_id = Category.category_id JOIN User on Petition.author_id = User.user_id group by Signature.petition_id order by signatureCount desc;'
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};

exports.getOne = async function(){
    return null;
};

exports.insert = async function( petition ) {
    console.log( `Request to insert ${pettion} into the database...` );
    const conn = await db.getPool().getConnection();
    const query = 'insert into Petition (pettion) values ( ? )';
    const [ result ] = await conn.query( query, [ pettion ] );
    conn.release();
    return result;
};

exports.alter = async function(){
    return null;
};

exports.remove = async function(){
    return null;
};