const logger = require("../utils/logger.js");
const dish_store = require("../models/dish_store.js");
const rest_store = require("../models/restaurant_store.js");

const dishes = {
    async index(request, response) {
        let dish_id = request.params.dish_id;
        let rest_id = request.params.restaurant_id;
        let dish_information = await dish_store.get_dish(rest_id, dish_id);
        let dish_ratings = await dish_store.get_dish_ratings(rest_id, dish_id);
        let rest_information = await rest_store.get_restaurant(rest_id);
        let rest_ratings = await rest_store.get_restaurant_ratings(rest_id);
        logger.info("INFO")
        logger.info(dish_information)
        logger.info(rest_information)
        let rate_link = "/restaurant/"+rest_id+"/dish/"+dish_id+"/rate";
        request.session.last_url = "restaurant/"+rest_id+"/dish/"+dish_id;

        if (request.session.rated_restaurants !== undefined) {
            rest_already_rated = request.session.rated_restaurants.includes(rest_id);
        } else rest_already_rated = false;

        if (request.session.rated_dishes !== undefined) {
            dish_already_rated = request.session.rated_dishes.some(([r_id, d_id]) => r_id == rest_id && d_id == dish_id);
        } else dish_already_rated = false;

        const viewData = {
            title: "Dish "+dish_information.name,
            dish_id: dish_id,
            rest_id: rest_id,
            dish_name: dish_information.name,
            rest_name: rest_information.name,
            dish_image: "/images/dishes"+dish_information.image,
            price: dish_information.price,
            description: dish_information.description,
            stars: dish_ratings[1],
            ratings: dish_ratings[0],
            restaurant_stars: rest_information[1],
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            rate: (request.path === rate_link),
            rate_link: rate_link,
            restaurant_rated: rest_already_rated,
            dish_rated: dish_already_rated
        }
        logger.info(request.session.rated_dishes);
        response.render("dish", viewData);
    },

    add_rating(request, response) {
        let dish_id = request.params.dish_id;
        let rest_id = request.params.restaurant_id;
        let information = get_dish_info(rest_id, dish_id);
        request.session.last_url = "restaurant/"+rest_id+"/dish/"+dish_id;
        let rate_link = "/restaurant/"+rest_id+"/dish/"+dish_id+"/rate";

        if (request.session.rated_restaurants != undefined) {
            rest_already_rated = request.session.rated_restaurants.includes(rest_id);
        } else rest_already_rated = false;

        request.session.rated_dishes.push([rest_id, dish_id]);

        const viewData = {
            title: "Dish "+information.dish_name,
            dish_id: dish_id,
            rest_id: rest_id,
            dish_name: information.dish_name,
            rest_name: information.rest_name,
            dish_image: information.dish_picture,
            price: information.price,
            description: information.description,
            stars: information.avg_rating,
            ratings: [
                {date: "15.07.2025", name: "Max Mustermann", stars: 5, description: "Great Pizza"},
                {date: "17.07.2025", name: "Maximilian", stars: 3, description: "Meh, average"},
                {date: "19.07.2025", name: "Type 1", stars: 4.5, description: "Realy Great"}
            ],
            restaurant_stars: information.restaurant_stars,
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            rate: false,
            restaurant_rated: rest_already_rated,
            dish_rated: true,
        }
        logger.info(request.session.rated_dishes);
        response.render("dish", viewData);
    },
}

module.exports = dishes;