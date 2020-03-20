const db = require('../../config/db');


exports.list = async function(q, categoryId, authorId, sortBy) {
    if (sortBy == "ALPHABETICAL_ASC") {
        sortBy = ' order by title asc';
    }
    else if (sortBy == "ALPHABETICAL_DESC") {
        sortBy = ' order by title desc';
    }
    else if (sortBy == "SIGNATURES_ASC") {
        sortBy = ' order by signatureCount asc';
    }
    else {
        sortBy = ' order by signatureCount desc';
    }
    if (q == null) {
        q = "%%";
    }
    else if (q != null) {
        q = "%" + q + "%";
    }
    if (authorId == null) {
        authorId = "%%";
    }
    else if (authorId != null) {
        authorId = "%" + authorId;
    }
    if (categoryId == null) {
        categoryId = "%%";
    }
    else if (categoryId != null) {
        categoryId = "%" + categoryId + "%";
    }
    const conn = await db.getPool().getConnection();
    const query = "select Signature.petition_id as petitionId, title, Category.name as category, User.name as authorName, count(Signature.petition_id) as signatureCount from Signature JOIN Petition on Signature.petition_id = Petition.petition_id JOIN Category on Petition.category_id = Category.category_id JOIN User on Petition.author_id = User.user_id where Petition.title LIKE ? and Petition.author_id LIKE ? and Petition.category_id LIKE ? group by Signature.petition_id" + sortBy;
    const [ rows ] = await conn.query( query, [q, authorId, categoryId]);
    conn.release();
    return rows;
};

exports.insert = async function(auth_token, title, description, categoryId, createdDate, closingDate) {
    const conn = await db.getPool().getConnection();
    const query = 'select user_id from User where auth_token = ?';
    const user_table = await conn.query( query, [auth_token] );
    if (user_table[0].length == 0) {
        return false;
    }
    const insertion = "insert into Petition (author_id, category_id, closing_date, created_date, description, title)  VALUES (?, ?, ?, ?, ?, ?)";
    const result = await conn.query(insertion, [user_table[0][0].user_id, categoryId, closingDate, createdDate, description, title]);
    return result[0].insertId;
};

exports.read = async function(pet_id) {
    const conn = await db.getPool().getConnection();
    const query = 'select Petition.petition_id as petitionId, Petition.title, Petition.description, Petition.author_id as authorId, User.name as authorName, User.city as authorCity, User.country as authorCountry, count(Signature.petition_id) as signatureCount, Category.name as category, Petition.created_date as createdDate, Petition.closing_date as closingDate\n' +
        'from Signature JOIN Petition on Signature.petition_id = Petition.petition_id JOIN User on User.user_id = Petition.author_id JOIN Category on Category.category_id = Petition.category_id\n' +
        'WHERE Petition.petition_id = ? group by Signature.petition_id';
    const result = await conn.query(query, [pet_id]);
    conn.release();
    return result[0];
}

exports.alter = async function(){
    return null;
};

exports.remove = async function(){
    return null;
};