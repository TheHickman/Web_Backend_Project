const db = require('../../config/db');
const crypto = require("crypto");

exports.hash = async function (password) {
    const hashed_man = crypto.createHash('md5').update(password).digest('hex');
    return hashed_man;
}

exports.register= async function( name, email, password, city, country ) {
    const conn = await db.getPool();
    const test = 'select * from User where email = ?';
    const test_result = await conn.query(test, [email]);
    if (test_result[0].length != 0) {
        return 400;
    }
    else {
        const hashed_man = await exports.hash(password);
        console.log(hashed_man);
        const query = 'insert into User (name, email, password, city, country ) values ( ?, ?, ?, ?, ? )';
        const [result] = await conn.query(query, [name, email, hashed_man, city, country]);
        return result.insertId;
    }
};

exports.login = async function(email, password){
    const token = crypto.randomBytes(16).toString('hex');
    const hashed_man = await exports.hash(password);
    const conn = await db.getPool();
    const updating = 'update User set auth_token = ? where email = ? and password = ?';
    const updated = await conn.query(updating, [token, email, hashed_man]);
    if (updated[0].affectedRows === 0) {
        return 400;
    }
    const authorised = 'select user_id as userId, auth_token as token from User where auth_token = ?';
    const answer = await conn.query(authorised, [token]);
    const return_vals = answer[0][0]
    return return_vals;
};

exports.logout = async function(token) {
    const conn = await db.getPool();
    const update = 'update User set auth_token = null where auth_token = ?';
    const updated = await conn.query(update, [token]);;
    if (updated[0].affectedRows == 0) {
        return 401;
    }
    return updated;
};

exports.retrieve = async function(user_id, token){
    const conn = await db.getPool();
    const exists = 'select * from User where user_id = ?';
    const doesnt = await conn.query(exists, [user_id]);
    if (doesnt[0].length == 0) {
        return doesnt[0];
    }
    const select = 'select auth_token from User where user_id = ?';
    const checking = await conn.query(select, [user_id]);
    if (checking[0][0].auth_token == token && token != undefined) {
        const check = 'select name, city, country, email from User where user_id = ? and auth_token = ?'
        const checked = await conn.query(check, [user_id, token]);
        return checked;
    }
    else {
        const check = 'select name, city, country from User where user_id = ?';
        const checked = await conn.query(check, [user_id]);
        return checked;
    }
};

exports.update = async function(auth_token, user_id, name, email, password, new_password, city, country) {
    const conn = await db.getPool();
    const email_test = 'select * from User where email = ?';
    const hashed_man = await exports.hash(password);
    const new_hash = await exports.hash(new_password);
    const test_result = await conn.query(email_test, [email]);
    if (test_result[0].length != 0) {
        return 400;
    }
    const select = 'select auth_token from User where user_id = ? and password = ?';
    const checking = await conn.query(select, [user_id, hashed_man]);
    if (checking[0].length == 0) {
        return 401;
    }
    if (checking[0][0].auth_token != auth_token) {
        return 401;
    }

    const correct_user = 'select user_id from User where auth_token = ?';
    const user_result = await conn.query(correct_user, [auth_token]);
    if (user_result[0][0].user_id != user_id) {
        return 403;
    }
    else {
        const test = 'select * from User where auth_token = ?';
        const result = await conn.query(test, [auth_token]);
        const old_name = result[0][0].name;
        const old_email = result[0][0].email;
        const old_city = result[0][0].city;
        const old_country = result[0][0].country;
        const up_dog = 'update User set name = IfNull(?, ?), password = IfNull(?, ?), email = IfNull(?, ?), city = IfNull(?, ?), country = IfNull(?, ?) where auth_token = ?';
        const updated = await conn.query(up_dog, [name, old_name, new_hash, hashed_man, email, old_email, city, old_city, country, old_country, auth_token]);
        return 200;
    }
};

exports.getPhoto = async function(userId) {
    const conn = await db.getPool();
    const file_name = 'select photo_filename from User where user_id = ?';
    const process = await conn.query(file_name, [userId]);
    if (process[0].length == 0) {
        return 404;
    }
    const result = process[0][0].photo_filename;
    return result;
};

exports.putPhoto = async function(userId, auth_token, file_name) {
    const conn = await db.getPool();
    if (auth_token.length == 0) {
        return 401;
    }
    const exists = 'select * from User where user_id = ?';
    const does_it = await conn.query(exists, [userId]);
    if (does_it[0].length == 0) {
        return 404;
    }
    const correct_user = 'select user_id from User where auth_token = ?';
    const user_result = await conn.query(correct_user, [auth_token]);
    if (user_result[0].length == 0) {
        return 401;
    }
    if (user_result[0][0].user_id != userId) {
        return 403;
    }
    else {
        const photo_exists = 'select photo_filename from User where user_id = ?';
        const does_photo = await conn.query(photo_exists, [userId]);
        if (does_photo[0][0].photo_filename == null) {
            const replace = 'update User set photo_filename = ? where user_id = ?';
            const replaced = await conn.query(replace, [file_name, userId])
            return 201;
        }
        else {
            const create = 'update User set photo_filename = ? where user_id = ?';
            const created = await conn.query(create, [file_name, userId])
            return 200;
        }
    }
};

exports.removePhoto = async function(userId, auth_token) {
    const conn = await db.getPool();
    const exists = 'select * from User where user_id = ?';
    const does_it = await conn.query(exists, [userId]);
    if (does_it[0].length == 0) {
        return 404;
    }
    const correct_user = 'select user_id from User where auth_token = ?';
    const user_result = await conn.query(correct_user, [auth_token]);
    if (user_result[0].length == 0) {
        return 401;
    }
    if (user_result[0][0].user_id != userId) {
        return 403;
    }
    else {
        const fname = 'select photo_filename from User where user_id = ?';
        const file_name = await conn.query(fname, [userId]);
        const result = file_name[0][0].photo_filename;
        const remove = 'update User set photo_filename = NULL where user_id = ?';
        const removed = await conn.query(remove, [userId])
        return result;
    }
};