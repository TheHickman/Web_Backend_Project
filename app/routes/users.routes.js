const users = require( '../controllers/user.controller' );
module.exports = function (app) {
    app.route(app.rootUrl + '/users')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:Id')
        .get(users.read)
        .patch(users.update);
};