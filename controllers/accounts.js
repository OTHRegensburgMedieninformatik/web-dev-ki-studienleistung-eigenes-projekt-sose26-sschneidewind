const user_store = require("../models/user_store");
const logger = require("../utils/logger")

function extract_user_info(request, user) {
    request.session.signed_in = true;
    request.session.name = user.name;
    request.session.surname = user.surname;
    request.session.email = user.email;
    request.session.street = user.street;
    request.session.postal_code = user.postal_code;
    request.session.city = user.city;
    request.session.country = user.country;
    request.session.rated_restaurants = [];
    request.session.rated_dishes = [];
}

const accounts = {
    login(request, response) {
        const viewData = {
            title: "Login"
        };
        response.render("login", viewData);
    },

    signup(request, response) {
        const viewData = {
            title: "Signup"
        };
        response.render("signup", viewData);
    },

    async register(request, response) {
        const user = request.body;
        const [postal_code, ...city] = String(request.body.city).split(" ");
        user.postal_code = Number(postal_code);
        user.city = city.join(" ");
        let err_arr = await user_store.add_user(user);
        if (err_arr[0] === 0) {
            extract_user_info(request, user);
             if (request.session !== undefined)
                if (request.session.last_url !== undefined) 
                    response.redirect(request.session.last_url);
                else
                    response.redirect("/")
            else
                response.redirect("/");
        } else if (err_arr[0] == 1) {
            let str = err_arr[1]
            if (String(str).includes("null")) str = "Error: No field of the signup-sheet may be empty!";
            const viewData = {
                title: "Signup",
                error: true,
                error_msg: str,
            }
            response.render("signup", viewData)
        }

    },

    logout(request, response) {
        request.session.signed_in = false;
        request.session.name = undefined;
        request.session.surname = undefined;
        response.redirect("/");
    },

    async authenticate(request, response) {
        let user = await user_store.authenticate(request.body.email, request.body.password);
        if (user !== undefined) {
            extract_user_info(request, user);
            if (request.session !== undefined)
                if (request.session.last_url !== undefined) 
                    response.redirect(request.session.last_url);
                else
                    response.redirect("/")
            else
                response.redirect("/");
        } else {
            logger.info("error! User was not found.")
            const viewData = {
                title: "Login",
                failed_login: true,
                error_msg: "Error: No User with those credentials exists!"
            }
            response.render("login", viewData)
        }
        
    },
}

module.exports = accounts;