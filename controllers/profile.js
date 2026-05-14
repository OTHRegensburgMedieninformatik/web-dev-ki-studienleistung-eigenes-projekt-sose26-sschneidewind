const logger = require("../utils/logger.js");

function make_view_data(title, request) {
  return {
      title: title,
      name: request.session.name,
      surname: request.session.surname,
      email: request.session.email,
      street: request.session.street,
      city: request.session.city,
      country: request.session.country,
  };
}

const profile = {
  index(request, response) {
    logger.info("Rendering customer profile for " + request.session.name);
    const viewData = {
        title: "Profile of " + request.session.name,
        signed_in: request.session.signed_in,
        name: request.session.name,
        surname: request.session.surname,
        restaurant_reviews: [
            {restaurant: "Luigis Pizzeria",  stars: 5, string: "Great Pizza, great service, great Everything!", rest_id:1},
            {restaurant: "Marios Nudel Restaurant", stars: 4, string: "great soup soup soup", rest_id:2},
            {restaurant: "Gumbat Rakete", stars: 1, string: "Not very authentic Asian cuisine!", rest_id:3}
        ],
        dish_reviews: [
            {restaurant: "Luigis Pizzeria", rest_id: 1, dish: "Pizza Margherita", dish_id:1, stars: 4, string:"Not much you can do wrong with this Pizza, but still delicious!"},
            {restaurant: "Marios Nudel Restaurant", rest_id: 2, dish: "Nudelsuppe rot weiß", dish_id:1, stars: 1, string:"I do not know who had the idea to add Ketchup and Mayonaise to soup, but I strongly disagree!"},
            {restaurant: "Luigis Pizzeria", rest_id: 1, dish: "Pizza Tonno", dish_id:2,  stars: 5, string:"A great Pizza in a Great Pizzeria! Gerne wieder."}
        ]
    };
    response.render("profile", viewData);
  },
  
  settings(request, response){
    logger.info("Rendering profile settings");
    const viewData = make_view_data("Settings", request);
    response.render("profile_settings", viewData);
  },

  change_attributes(request, response) {
    vals = request.body;
    logger.info(vals);
    //here would be authentication if password is correct but we skip it
    request.session.name = vals.name;
    request.session.surname = vals.surname;
    request.session.email = vals.email;
    request.session.street = vals.street;
    request.session.city = vals.city;
    request.session.country = vals.country;
    const viewData = make_view_data("Settings", request);
    response.render("profile_settings", viewData);
  }
};

module.exports = profile;
