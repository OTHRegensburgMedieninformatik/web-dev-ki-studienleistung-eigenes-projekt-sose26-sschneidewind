const user_store = require("../models/user_store");
const logger = require("../utils/logger")

async function extract_user_info(request, user) { //
    request.session.user_id = user.id;
    request.session.name = user.name;
    request.session.surname = user.surname;
    request.session.email = user.email;
    request.session.street = user.street;
    request.session.postal_code = user.postal_code;
    request.session.city = user.city;
    request.session.country = user.country;
    let restaurant_response = await user_store.get_already_rated_restaurants(user.id);
    let dish_response = await user_store.get_already_rated_dishes_restaurants(user.id);
    request.session.rated_restaurants = restaurant_response !== undefined ? restaurant_response : [];
    request.session.rated_dishes = dish_response !== undefined ? dish_response : [];
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
        let err_arr = await user_store.add_user(user);
        if (err_arr[0] === 0) { //if user was correctly added returns to the last url or the home if the site was directly accessed over the login page
            await extract_user_info(request, user);
            if (request.session !== undefined && request.session.last_url !== undefined)
                response.redirect(request.session.last_url);
            else
                response.redirect("/");
        } else if (err_arr[0] == 1) { //on error renders the signup page again with the error being displayed
            let str = err_arr[1]
            if (String(str).includes("null")) str = "Error: No field of the signup-sheet may be empty!"; //currently only catches if error was because every field is not null
            else if (String(str).includes("unique constraint")) str = "Error: The email "+err_arr[2][0]+" already has an existing account!";
            let user_info = err_arr[2];
            logger.info(user_info);
            const viewData = {  //also puts the current inputs back into viewData so that not everything needs to be typed in again
                title: "Signup",
                error: true,
                error_msg: str,
                name: user_info[1], //sadly with array indices since it returns the values of the query which are stored in an array, not an object
                surname: user_info[2],
                street: user_info[3],
                postal_code: user_info[4],
                city: user_info[5],
                country: user_info[6],
                email: user_info[0],
            }
            response.render("signup", viewData)
        }

    },

    logout(request, response) { //standard logout
        request.session.destroy();
        response.redirect("/");
    },

    async authenticate(request, response) {
        const user = await user_store.authenticate(request.body.email, request.body.password);
        if (user !== undefined) { //if it could correctly get a user save the user information in the session (all needed later) and redirect
            await extract_user_info(request, user);
            if (request.session !== undefined && request.session.last_url !== undefined) 
                response.redirect(request.session.last_url);
            else
                response.redirect("/");
        } else {
            logger.info("error! User was not found.")
            const viewData = { //error for wrong credentials
                title: "Login",
                failed_login: true,
                error_msg: "Error: No User with those credentials exists!"
            }
            response.render("login", viewData)
        }
        
    },
}

module.exports = accounts;