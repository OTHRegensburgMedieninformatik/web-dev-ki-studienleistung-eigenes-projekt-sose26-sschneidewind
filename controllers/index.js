const logger = require("../utils/logger.js");

function get_global_restaurants() {
  //just get best global restaurants
  return [
    {place: 1, restaurant: "Luigis Pizzeria", rest_id:1},
    {place: 2, restaurant: "Marios Nudel Restaurant", rest_id:2},
    {place: 3, restaurant: "Gumbat Rakete", rest_id:3}
  ]
}

function get_local_restaurants(email)  {
  //here will be a lookup for local restaurants near user with email
  return [
    {place: 1, restaurant: "Gumbat Rakete", rest_id:3},
    {place: 2, restaurant: "Marios Nudel Restaurant", rest_id:2},
    {place: 3, restaurant: "Luigis Pizzeria", rest_id:1}
  ]
}

function get_global_dishes() {
  //just get globally best performing dishes
  return [
    {place: 1, restaurant: "Luigis Pizzeria", rest_id:1, dish: "Pizza Margherita", dish_id : 1},
    {place: 2, restaurant: "Gumbat Rakete", rest_id:3, dish: "soup soup soup", dish_id : 1},
    {place: 3, restaurant: "Marios Nudel Restaurant", rest_id:2, dish: "Nudelsuppe rot weiß", dish_id : 1},
  ]
}

function get_local_dishes(email) {
  //here will be another lookup but this time for the best dish of all restaurants near one
  return [
    {place: 1, restaurant: "Gumbat Rakete", rest_id:3, dish: "soup soup soup", dish_id : 1},
    {place: 2, restaurant: "Marios Nudel Restaurant", rest_id:2, dish: "Nudelsuppe rot weiß", dish_id : 1},
    {place: 3, restaurant: "Luigis Pizzeria", rest_id:1, dish: "Pizza Margherita", dish_id : 1}
  ]
}

const index = {
  index(request, response) {
    request.session.last_url = "/";
    logger.info("index rendering, name is: " + request.session.name);
    if (request.session.signed_in) {
      restaurants = get_local_restaurants(request.session.email);
      dishes = get_local_dishes(request.session.email);
    } else {
      restaurants = get_global_restaurants();
      dishes = get_global_dishes();
    }
    const viewData = {
      title: "Critical Restaurant",
      signed_in: request.session.signed_in,
      name: request.session.name,
      surname: request.session.surname,
      restaurants: restaurants,
      dishes: dishes
    };
    response.render("index", viewData);
  },
};

module.exports = index;
