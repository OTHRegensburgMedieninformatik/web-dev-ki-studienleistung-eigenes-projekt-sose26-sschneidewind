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
        request.session.name = "Max Mustermann";
        response.redirect("/");
    },

    logout(request, response) {
        request.session.signed_in = false;
        request.session.name = undefined;
        response.redirect("/");
    },

    authenticate(request, response) {
        request.session.signed_in = true;
        request.session.name = "Max Mustermann";
        response.redirect("/");
    },
}

module.exports = accounts;