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
    const resp = await fetch("https://nominatim.openstreetmap.org/search?format=geocodejson&street=Friedenstraße.17&city=Regensburg");
    const data = await resp.json();
    let base_coords = data.features[0].geometry.coordinates;
    if (request.session.coords !== undefined) {
      base_coords = request.session.coords
    } else if (request.session.logged_in) {
      base_coords = await user_store.generate_coords(request.session.user_id);
    }
    logger.info(base_coords);
    const viewData = {
      title: "Critical Restaurant",
      signed_in: request.session.signed_in,
      name: request.session.name,
      surname: request.session.surname,
      restaurants_exist: restaurants !== undefined,
      restaurants: restaurants,
      dishes_exist: dishes !== undefined,
      dishes: dishes,
      center_coords: base_coords,
    };
    response.render("index", viewData);
  },
};

module.exports = index;
