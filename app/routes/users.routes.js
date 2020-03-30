const users = require( '../controllers/users.controller' );
module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(users.retrieve)
        .patch(users.update);
    app.route(app.rootUrl + '/users/:id/photo')
        .get(users.getPhoto)
        .put(users.putPhoto)
        .delete(users.deletePhoto);
};