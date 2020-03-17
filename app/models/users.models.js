const db = require('../../config/db');
const crypto = require("crypto");

exports.register= async function( name, email, password, city, country ) {
    console.log( `Request to insert user into the database...` );
    const conn = await db.getPool().getConnection();
    const test = 'select * from User where email = ?';
    const test_result = await conn.query(test, [email]);
    if (test_result[0].length != 0) {
        return true;
    }
    else {
        const query = 'insert into User (name, email, password, city, country ) values ( ?, ?, ?, ?, ? )';
        const [result] = await conn.query(query, [name, email, password, city, country]);
        conn.release();
        return result.insertId;
    }
};

exports.login = async function(email, password){
    const token = crypto.randomBytes(16).toString('hex');
    const conn = await db.getPool().getConnection();
    const updating = 'update User set auth_token = ? where email = ? and password = ?';
    const updated = await conn.query(updating, [token, email, password]);
    if (updated[0].affectedRows === 0) {
        return false;
    }
    const authorised = 'select user_id, auth_token from User where auth_token = ?';
    const answer = await conn.query(authorised, [token]);
    conn.release;
    return_vals = answer[0][0]
    return return_vals;
};

exports.logout = async function() {
    return null
};

exports.retrieve = async function(){
    return null;
};

exports.update = async function() {
    return null;
};