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
    const conn = await db.getPool()
    const query = "select Signature.petition_id as petitionId, title, Category.name as category, User.name as authorName, count(Signature.petition_id) as signatureCount from Signature JOIN Petition on Signature.petition_id = Petition.petition_id JOIN Category on Petition.category_id = Category.category_id JOIN User on Petition.author_id = User.user_id where Petition.title LIKE ? and Petition.author_id LIKE ? and Petition.category_id LIKE ? group by Signature.petition_id" + sortBy;
    const [ rows ] = await conn.query( query, [q, authorId, categoryId]);
    return rows;
};

exports.insert = async function(auth_token, title, description, categoryId, createdDate, closingDate) {
    const conn = await db.getPool();
    const query = 'select user_id from User where auth_token = ?';
    const user_table = await conn.query(query, [auth_token] );
    if (user_table[0].length == 0) {
        return 401;

    }
    const insertion = "insert into Petition (author_id, category_id, closing_date, created_date, description, title)  VALUES (?, ?, ?, ?, ?, ?)";
    const result = await conn.query(insertion, [user_table[0][0].user_id, categoryId, closingDate, createdDate, description, title]);
    return result[0].insertId;
};




exports.read = async function(pet_id) {
    const conn = await db.getPool();
    const query = 'select Petition.petition_id as petitionId, Petition.title, Petition.description, Petition.author_id as authorId, User.name as authorName, User.city as authorCity, User.country as authorCountry, count(Signature.petition_id) as signatureCount, Category.name as category, Petition.created_date as createdDate, Petition.closing_date as closingDate\n' +
        'from Signature JOIN Petition on Signature.petition_id = Petition.petition_id JOIN User on User.user_id = Petition.author_id JOIN Category on Category.category_id = Petition.category_id\n' +
        'WHERE Petition.petition_id = ? group by Signature.petition_id';
    const result = await conn.query(query, [pet_id]);
    return result[0];
}



exports.alter = async function(pet_id, auth_token, title, description, categoryId, closingDate){
    const conn = await db.getPool();
    const user = 'select user_id from User where auth_token = ?';
    const is_logged = await conn.query(user, [auth_token])
    if (is_logged[0].length == 0) {
        return 401;
    }
    const is_petition = "select author_id from Petition where petition_id = ?";
    const belongs = await conn.query(is_petition, [pet_id]);
    if (belongs[0].length == 0) {
        return 404;
    }
    if (is_logged[0][0].user_id != belongs[0][0].author_id) {
        return 403;
    }
    const test = 'select * from Petition where petition_id = ?';
    const result = await conn.query(test, [pet_id]);
    const old_title = result[0][0].title;
    const old_category = result[0][0].category_id;
    const old_description = result[0][0].description;
    const old_closing_date = result[0][0].closing_date;
    let now = new Date();
    if (old_closing_date != null) {
        if (old_closing_date <= now) {
            return 400;
        }
    }
    const up_dog = 'update Petition set title = IfNull(?, ?), category_id = IfNull(?, ?), description = IfNull(?, ?), closing_date = IfNull(?, ?) where petition_id = ?';
    const updated = await conn.query(up_dog, [title, old_title, categoryId, old_category, description, old_description, closingDate, old_closing_date, pet_id]);
};

exports.remove = async function(pet_id, auth_token){
    const conn = await db.getPool();
    const is_u = 'select user_id from User where auth_token = ?';
    const is_logged = await conn.query(is_u, [auth_token])
    if (is_logged[0].length == 0) {
        return 401;
    }
    const is_petition = "select author_id from Petition where petition_id = ?";
    const belongs = await conn.query(is_petition, [pet_id]);
    if (belongs[0].length == 0) {
        return 404;
    }
    if (is_logged[0][0].user_id != belongs[0][0].author_id) {
        return 403;
    }
    const query = 'DELETE from Petition where petition_id = ?';
    const result = await conn.query(query, [pet_id]);
};

exports.listcats = async function() {
    const conn = await db.getPool();
    const query = 'select category_id as categoryId, name from Category';
    const result = await conn.query(query);
    return result[0];
};

exports.getSigs = async function(pet_id) {
    const conn = await db.getPool();
    const query = "select signatory_id as signatoryId, User.name as name, User.city as city, User.country as country, signed_date as signedDate from Signature JOIN User on Signature.signatory_id = User.user_id where petition_id = ? order by signedDate asc";
    const result = await conn.query(query, [pet_id]);
    return result[0];
};

exports.postSigs = async function(auth_token, pet_id) {
    const conn = await db.getPool();
    const exists = 'select * from Petition where petition_id = ?';
    const does_it = await conn.query(exists, [pet_id]);
    if (does_it[0].length == 0) {
        return 404;
    }
    const closed = 'select closing_date from Petition where petition_id = ?';
    const is_closed = await conn.query(closed, [pet_id]);
    const closing_date = is_closed[0][0].closing_date;
    let now = new Date();
    if (closing_date <= now) {
        return 403
    }
    const is_logged = 'select user_id from User where auth_token = ?';
    const user_table = await conn.query(is_logged, [auth_token]);
    if (user_table[0].length == 0) {
        return 401;
    }
    const user_id = user_table[0][0].user_id;
    const has_signed = 'select signatory_id from Signature where signatory_id = ? and petition_id = ?';
    const have_you = await conn.query(has_signed, [user_id, pet_id]);
    if (have_you[0].length != 0) {
        return 403;
    }
    const insertion = 'insert into Signature (petition_id, signatory_id, signed_date) VALUES (?, ?, ?)';
    const has_inserted = await conn.query(insertion, [pet_id, user_id, now]);
    return true;
};

exports.removeSigs = async function(auth_token, pet_id) {
    const conn = await db.getPool();
    const exists = 'select * from Petition where petition_id = ?';
    const does_it = await conn.query(exists, [pet_id]);
    if (does_it[0].length == 0) {
        return 404;
    }
    const is_logged = 'select user_id from User where auth_token = ?';
    const user_table = await conn.query(is_logged, [auth_token]);
    if (user_table[0].length == 0) {
        return 401;
    }
    const user_id = user_table[0][0].user_id;
    const is_author = 'select author_id, petition_id from Petition where author_id = ? and petition_id = ?';
    const authored = await conn.query(is_author, [user_id, pet_id]);
    if (authored[0].length != 0) {
        return 403;
    }
    const has_signed = 'select signatory_id from Signature where signatory_id = ? and petition_id = ?';
    const have_you = await conn.query(has_signed, [user_id, pet_id]);
    if (have_you[0].length == 0) {
        return 403;
    }
    const closed = 'select closing_date from Petition where petition_id = ?';
    const is_closed = await conn.query(closed, [pet_id]);
    const closing_date = is_closed[0][0].closing_date;
    let now = new Date();
    if (closing_date <= now) {
        return 403
    }
    const deletion = 'delete from Signature where signatory_id = ? and petition_id = ?';
    const is_delete = await conn.query(deletion, [user_id, pet_id]);
    return 200;
};

exports.getPhoto = async function(pet_id) {
    const conn = await db.getPool();
    const query = 'select photo_filename from Petition where petition_id = ?';
    const result = await conn.query(query, [pet_id]);
    if (result[0].length == 0) {
        return 404;
    }
    const filename = result[0][0].photo_filename;
    return filename;
};

exports.postPhoto = async function(auth_token, pet_id, file_name) {
    const conn = await db.getPool();
    const exists = 'select * from Petition where petition_id = ?';
    const does_it = await conn.query(exists, [pet_id]);
    if (does_it[0].length == 0) {
        return 404;
    }
    const is_logged = 'select user_id from User where auth_token = ?';
    const user_table = await conn.query(is_logged, [auth_token]);
    if (user_table[0].length == 0) {
        return 401;
    }
    const user_id = user_table[0][0].user_id;
    const is_author = 'select author_id, petition_id from Petition where author_id = ? and petition_id = ?';
    const authored = await conn.query(is_author, [user_id, pet_id]);
    if (authored[0].length == 0) {
        return 403;
    }
    const photo_exists = 'select photo_filename from Petition where petition_id = ?';
    const does_photo = await conn.query(photo_exists, [pet_id]);
    if (does_photo[0][0].photo_filename == null) {
        console.log('here');
        const replace = 'update Petition set photo_filename = ? where petition_id = ?';
        const replaced = await conn.query(replace, [file_name, pet_id])
        return 201;
    }
    else {
        const create = 'update Petition set photo_filename = ? where petition_id = ?';
        const created = await conn.query(create, [file_name, pet_id])
        return 200;
    }
}