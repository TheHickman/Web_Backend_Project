const db = require('../../config/db');
const crypto = require("crypto");

exports.register= async function( name, email, password, city, country ) {
    const conn = await db.getPool().getConnection();
    const test = 'select * from User where email = ?';
    const test_result = await conn.query(test, [email]);
    if (test_result[0].length != 0) {
        conn.release();
        return true;
    }
    else {
        const query = 'insert into User (name, email, password, city, country ) values ( ?, ?, ?, ?, ? )';
        const [result] = await conn.query(query, [name, email, password, city, country]);
        conn.release();
        return result.insertId;
    }
    conn.release();
};

exports.login = async function(email, password){
    const token = crypto.randomBytes(16).toString('hex');
    const conn = await db.getPool().getConnection();
    const updating = 'update User set auth_token = ? where email = ? and password = ?';
    const updated = await conn.query(updating, [token, email, password]);
    if (updated[0].affectedRows === 0) {
        conn.release();
        return false;
    }
    const authorised = 'select user_id as userId, auth_token as token from User where auth_token = ?';
    const answer = await conn.query(authorised, [token]);
    conn.release();
    return_vals = answer[0][0]
    return return_vals;
};

exports.logout = async function(token) {
    const conn = await db.getPool().getConnection();
    const update = 'update User set auth_token = null where auth_token = ?';
    const updated = await conn.query(update, [token]);;
    if (updated[0].affectedRows == 0) {
        conn.release();
        return true;
    }
    conn.release();
    return updated;
};

exports.retrieve = async function(user_id, token){
    const conn = await db.getPool().getConnection();
    const exists = 'select * from User where user_id = ?';
    const doesnt = await conn.query(exists, [user_id]);
    if (doesnt[0].length == 0) {
        conn.release();
        return doesnt[0];
    }
    const select = 'select auth_token from User where user_id = ?';
    const checking = await conn.query(select, [user_id]);
    if (checking[0][0].auth_token == token && token != undefined) {
        const check = 'select name, city, country, email from User where user_id = ? and auth_token = ?'
        const checked = await conn.query(check, [user_id, token]);
        conn.release();
        return checked;
    }
    else {
        const check = 'select name, city, country from User where user_id = ?';
        const checked = await conn.query(check, [user_id]);
        conn.release();
        return checked;
    }
    conn.release();
};

exports.update = async function(auth_token, user_id, name, email, password, new_password, city, country) {
    const conn = await db.getPool().getConnection();
    const email_test = 'select * from User where email = ?';
    const test_result = await conn.query(email_test, [email]);
    if (test_result[0].length != 0) {
        conn.release();
        return 2;
    }
    const select = 'select auth_token from User where user_id = ? and password = ?';
    const checking = await conn.query(select, [user_id, password]);
    if (checking[0].length == 0) {
        conn.release();
        return false;
    }
    if (checking[0][0].auth_token != auth_token) {
        conn.release();
        return false;
    }

    const correct_user = 'select user_id from User where auth_token = ?';
    const user_result = await conn.query(correct_user, [auth_token]);
    if (user_result[0][0].user_id != user_id) {
        conn.release();
        return 3;
    }
    else {
        const test = 'select * from User where auth_token = ?';
        const result = await conn.query(test, [auth_token]);
        const old_name = result[0][0].name;
        const old_email = result[0][0].email;
        const old_city = result[0][0].city;
        const old_country = result[0][0].country;
        const up_dog = 'update User set name = IfNull(?, ?), password = IfNull(?, ?), email = IfNull(?, ?), city = IfNull(?, ?), country = IfNull(?, ?) where auth_token = ?';
        const updated = await conn.query(up_dog, [name, old_name, new_password, password, email, old_email, city, old_city, country, old_country, auth_token]);
        conn.release();
        return 1;
    }
    conn.release();
};

exports.getPhoto = async function(userId) {
    const conn = await db.getPool().getConnection();
    const file_name = 'select photo_filename from User where user_id = ?';
    const process = await conn.query(file_name, [userId]);
    if (process[0].length == 0) {
        console.log('hey');
        conn.release();
        return 404;
    }
    const result = process[0][0].photo_filename;
    conn.release();
    return result;
};

exports.putPhoto = async function(userId, auth_token, file_name) {
    const conn = await db.getPool().getConnection();
    const exists = 'select * from User where user_id = ?';
    const does_it = await conn.query(exists, [userId]);
    if (does_it[0].length == 0) {
        conn.release();
        return 404;
    }
    const correct_user = 'select user_id from User where auth_token = ?';
    const user_result = await conn.query(correct_user, [auth_token]);
    if (user_result[0][0].user_id != userId) {
        conn.release();
        return 401;
    }
    else {
        const photo_exists = 'select photo_filename from User where user_id = ?';
        const does_photo = await conn.query(photo_exists, [userId]);
        if (does_photo[0][0].photo_filename == null) {
            const create = 'update User set photo_filename = ? where user_id = ?';
            const replaced = await conn.query(replace, [file_name, userId])
            conn.release();
            return 201;
        }
        else {
            const create = 'update User set photo_filename = ? where user_id = ?';
            const created = await conn.query(create, [file_name, userId])
            conn.release();
            return 200;
        }
        conn.release();
    }
};