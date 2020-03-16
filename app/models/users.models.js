const db = require('../../config/db');
const crypto = require("crypto");

exports.insert = async function( name, email, password, city, country ) {
    console.log( `Request to insert user into the database...` );
    const conn = await db.getPool().getConnection();
    const query = 'insert into lab2_users (name, email, password, city, country ) values ( ?, ?, ?, ?, ? )';
    const [ result ] = await conn.query( query, [ name, email, password, city, country  ] );
    conn.release();
    return result;
};

exports.login = async function(){
    return null;
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