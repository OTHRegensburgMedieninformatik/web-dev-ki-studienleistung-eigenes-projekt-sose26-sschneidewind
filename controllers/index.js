const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");
const dish_store = require("../models/dish_store.js");

const index = {
  async index(request, response) {
    request.session.last_url = "/";
    logger.info("index rendering, name is: " + request.session.name);
    let restaurants = await restaurant_store.get_top_restaurants(request.session.user_id); //since session.user_id is undefined when not signed in, it automatically handles the login / not logged in distinction :)
    let dishes = await dish_store.get_top_dishes(request.session.user_id); // same as above
    restaurants = restaurants ? restaurants.map(row => ({...row, has_rating : row.stars !== null})) : undefined;
    dishes = dishes ? dishes.map(row => ({...row, has_rating : row.stars !== null})) : undefined;

    logger.info(dishes);

    const viewData = {
      title: "Critical Restaurant",
      signed_in: request.session.signed_in,
      name: request.session.name,
      surname: request.session.surname,
      restaurants_exist: restaurants !== undefined,
      restaurants: restaurants,
      dishes_exist: dishes !== undefined,
      dishes: dishes
    };
    response.render("index", viewData);
  },
};

module.exports = index;
