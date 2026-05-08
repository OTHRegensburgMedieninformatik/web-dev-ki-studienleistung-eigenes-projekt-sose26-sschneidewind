const logger = require("../utils/logger.js");

const profile = {
  index(request, response) {
    logger.info("Rendering customer profile for " + request.session.name);
    const viewData = {
        title: "Profile of " + request.session.name,
        signed_in: request.session.signed_in,
        name: request.session.name,
      surname: request.session.surname,
        restaurant_reviews: [
            {restaurant: "Luigis Pizzeria", stars: 5, string: "Great Pizza, great service, great Everything!"},
            {restaurant: "Marios Nudel Restaurant", stars: 4, string: "great soup soup soup"},
            {restaurant: "Gumbat Rakete", stars: 1, string: "Not very authentic Asian cuisine!"}
        ],
        dish_reviews: [
            {restaurant: "Luigis Pizzeria", dish: "Pizza Margherita", stars: 4, string:"Not much you can do wrong with this Pizza, but still delicious!"},
            {restaurant: "Marios Nudel Restaurant", dish: "Nudelsuppe rot weiß", stars: 1, string:"I do not know who had the idea to add Ketchup and Mayonaise to soup, but I strongly disagree!"},
            {restaurant: "Luigis Pizzeria", dish: "Pizza Tonno", stars: 5, string:"A great Pizza in a Great Pizzeria! Gerne wieder."}
        ]
    };
    response.render("profile", viewData);
  },
  settings(request, response){
    logger.info("Rendering profile settings");
    const viewData = {
      title: "Settings",
      name: request.session.name,
      surname: request.session.surname,
      email: request.session.email,
      street: request.session.street,
      city: request.session.city,
      country: request.session.country,
    };
    response.render("profile_settings", viewData);
  }
};

module.exports = profile;
