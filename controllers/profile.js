const logger = require("../utils/logger.js");
const user_store = require("../models/user_store.js")

function make_view_data(title, request) {
  return {
      title: title,
      signed_in: request.session.signed_in,
      name: request.session.name,
      surname: request.session.surname,
      email: request.session.email,
      street: request.session.street,
      postal_code: request.session.postal_code,
      city: request.session.city,
      country: request.session.country,
  };
}

async function update_data(request, user) {
  coords = await user_store.add_and_get_coords(user);
  request.session.name = user.name;
  request.session.surname = user.surname;
  request.session.email = user.newEmail === '' ? user.email : user.newEmail;
  request.session.street = user.street;
  request.session.postal_code = user.postal_code;
  request.session.city = user.city;
  request.session.country = user.country;
  request.session.lat = coords ? coords[0] : undefined;
  request.session.long = coords ? coords[1] : undefined;
}

const profile = {
  async index(request, response) {
    logger.info("Rendering customer profile for " + request.session.name);
    const viewData = {
        title: "Profile of " + request.session.name,
        signed_in: request.session.signed_in,
        name: request.session.name,
        surname: request.session.surname,
        user_id: request.session.user_id,
        restaurant_reviews: await user_store.get_user_dish_or_restaurant_ratings(request.session.user_id, false), //getting the rated restaurants
        dish_reviews: await user_store.get_user_dish_or_restaurant_ratings(request.session.user_id, true), //getting the rated dishes
    };
    response.render("profile", viewData);
  },
  
  settings(request, response){
    logger.info("Rendering profile settings");
    const viewData = make_view_data("Settings", request);
    response.render("profile_settings", viewData);
  },

  async change_attributes(request, response) {
    let user = request.body;
    logger.info(user);
    let user_response = await user_store.authenticate(user.email, user.password)
    let viewData = make_view_data("Settings", request);
    if (user_response === undefined) { //error regarding user authentication
      viewData.error = true;
      viewData.error_msg = "Error: password is wrong for this email!";
      response.render("profile_settings", viewData);
    } else {
      let change_response = await user_store.change_attributes(user); //actually do the database query for the attribute change
      if (change_response[0] === 1) { //error regarding changing of attributes
        viewData.error = true;
        viewData.error_msg = change_response[1];
        response.render("profile_settings", viewData);
      } else {
        await update_data(request, user);
        let viewData = make_view_data("Settings", request);
        response.render("profile_settings", viewData);
      }
    }
  }
};

module.exports = profile;