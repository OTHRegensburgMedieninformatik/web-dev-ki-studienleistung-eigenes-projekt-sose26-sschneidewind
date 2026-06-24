const user_store = require("../models/user_store");
const logger = require("../utils/logger")

async function extract_user_info(request, user) { //
    let coords; 
    if ((user.lat === null) || (user.long === null)) { //extract coordinates of the user if the latitude and longitude are not yet calculated 
        coords = await user_store.add_and_get_coords(user);
    } else {
        coords = [user.lat, user.long];
    }
    //extract all remaining information for the user into the session
    request.session.user_id = user.id;
    request.session.signed_in = true;
    request.session.name = user.name;
    request.session.surname = user.surname;
    request.session.email = user.email;
    request.session.street = user.street;
    request.session.postal_code = user.postal_code;
    request.session.city = user.city;
    request.session.country = user.country;
    request.session.lat = coords !== undefined ? coords[0] : undefined;
    request.session.long = coords !== undefined ? coords[1] : undefined;
    let restaurant_response = await user_store.get_already_rated_restaurants(user.id); //get all rated restaurants and dishes
    let dish_response = await user_store.get_already_rated_dishes_restaurants(user.id);
    request.session.rated_restaurants = restaurant_response !== undefined ? restaurant_response : []; //error handling for if ratings for something do not yet exist
    request.session.rated_dishes = dish_response !== undefined ? dish_response : [];
}

function make_error_view_data(user_info, str) {
    return {  //also puts the current inputs back into viewData so that not everything needs to be typed in again
        title: "Signup",
        error: true,
        error_msg: str,
        name: user_info.name,
        surname: user_info.surname,
        street: user_info.street,
        postal_code: user_info.postal_code,
        city: user_info.city,
        country: user_info.country,
        email: user_info.email,
    }
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
        let user = request.body;
        if (!Object.values(user).every(value => value !== "")) {
            logger.info("Some fields were empty!")
            return response.render("signup", make_error_view_data(user, "No Field may be empty!"));
        }
        let err_arr = await user_store.add_user(user);
        if (err_arr[0] === 0) { //if user was correctly added returns to the last url or the home if the site was directly accessed over the login page
            user = await user_store.authenticate(request.body.email, request.body.password); //redefine user to the user logged in with the current credentials (just getting the new values, p.ex. user_id since this is defined by the database and cannot be determined without another query)
            await extract_user_info(request, user);
            if (request.session !== undefined && request.session.last_url !== undefined)
                return response.redirect(request.session.last_url);
            else
                return response.redirect("/");
        } else if (err_arr[0] == 1) { //on error renders the signup page again with the error being displayed
            let str = err_arr[1]
            if (String(str).includes("null")) str = "Error: No field of the signup-sheet may be empty!"; //currently only catches if error was because every field is not null
            else if (String(str).includes("unique constraint")) str = "Error: The email "+  user.email+" already has an existing account!"; //or a unique constraint was violated
            return response.render("signup", make_error_view_data(user, str));
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