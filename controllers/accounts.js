const accounts = {
    login(request, response) {
        const viewData = {
            title: "Login to the Service"
        };
        response.render("login", viewData);
    },

    signup(request, response) {
        const viewData = {
            title: "Signup for the Service"
        };
        response.render("signup", viewData);
    },

    register(request, response) {
        request.session.signed_in = true;
        response.redirect("/");
    },

    logout(request, response) {
        request.session.signed_in = false;
        response.redirect("/");
    },

    authenticate(request, response) {
        request.session.signed_in = true;
        response.redirect("/");
    },
}

module.exports = accounts;