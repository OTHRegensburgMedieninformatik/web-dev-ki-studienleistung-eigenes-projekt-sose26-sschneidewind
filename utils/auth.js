const auth = {
    protected(request, response, next) {
        if (request.session.user_id) {
            next();
        } else {
            response.redirect('/');
        }
    },
}

module.exports = auth;