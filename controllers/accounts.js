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
        request.session.name = "Max";
        request.session.surname = "Mustermann"
        request.session.email = "maxmustermann@gmail.com",
        request.session.street = "Palmenweg 3",
        request.session.city = "93051 Regensburg",
        request.session.country = "Germany",
        request.session.rated_restaurants = [],
        request.session.rated_dishes = []
        response.redirect(request.session.last_url);
    },

    logout(request, response) {
        request.session.signed_in = false;
        request.session.name = undefined;
        request.session.surname = undefined;
        response.redirect("/");
    },

    authenticate(request, response) {
        request.session.signed_in = true;
        request.session.name = "Max";
        request.session.surname = "Mustermann"
        request.session.email = "maxmustermann@gmail.com",
        request.session.street = "Palmenweg 3",
        request.session.city = "93051 Regensburg",
        request.session.country = "Germany",
        request.session.rated_restaurants = [],
        request.session.rated_dishes = []
        response.redirect(request.session.last_url);
    },
}

module.exports = accounts;