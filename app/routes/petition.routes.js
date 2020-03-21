const petitions = require( '../controllers/petitons.controller' );
module.exports = function( app ) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.lister)
        .post( petitions.create );
    app.route(app.rootUrl + '/petitions/categories' )
        .get(petitions.getCatInfo);
    app.route(app.rootUrl + '/petitions/:id' )
        .get( petitions.read )
        .patch( petitions.update )
        .delete( petitions.delete );
    app.route(app.rootUrl + "/petitions/:id/signatures")
        .get(petitions.getSigs)
        .post(petitions.postSigs)
        .delete(petitions.removeSigs);
    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petitions.getPhoto)
        .put(petitions.putPhoto);
};