const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");
const dish_store = require("../models/dish_store.js");

const index = {
  async index(request, response) {
    request.session.last_url = "/";
    logger.info("index rendering, name is: " + request.session.name);
    let restaurants = await restaurant_store.get_top_restaurants(request.session.user_id); //since session.user_id is undefined when not signed in, it automatically handles the login / not logged in distinction :)
    let dishes = await dish_store.get_top_dishes(request.session.user_id); // same as above
    restaurants = restaurants ? restaurants.map(row => ({...row, has_rating : row.stars !== null})) : undefined; //adding an extra key for each row for displaying
    dishes = dishes ? dishes.map(row => ({...row, has_rating : row.stars !== null})) : undefined;
    
    //get the coordinates where the map is going to be centered around
    const resp = await fetch("https://nominatim.openstreetmap.org/search?format=geocodejson&street=Friedenstraße.17&city=Regensburg");
    const data = await resp.json();
    let base_coords = data.features[0].geometry.coordinates;
    if ((request.session.lat !== undefined) && (request.session.long !== undefined)) {
      base_coords = [request.session.long, request.session.lat];
    }

    let all_restaurants = await restaurant_store.get_all_restaurants();
    for (var i = 0; i<all_restaurants.length; ++i) {
      if ((all_restaurants[i].lat === null) || (all_restaurants[i].long === null)) { //if the restaurant has no coords yet, add the coordinates into the database and into the object
        const coords = await restaurant_store.add_and_get_coords(all_restaurants[i]);
        all_restaurants[i] = {...all_restaurants[i], lat : coords ? coords[0] : undefined, long : coords ? coords[1] : undefined};
      }
    }

    const viewData = {
      title: "Critical Restaurant",
      signed_in: request.session.signed_in,
      name: request.session.name,
      surname: request.session.surname,
      restaurants_exist: restaurants !== undefined,
      restaurants: restaurants,
      all_restaurants: JSON.stringify(all_restaurants),
      dishes_exist: dishes !== undefined,
      dishes: dishes,
      center_coords: base_coords,
    };
    response.render("index", viewData);
  },
};

module.exports = index;