const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");
const dish_store = require("../models/dish_store.js");

async function make_view_data(request, response, rest_id) {
    let restaurant_data = await restaurant_store.get_restaurant(rest_id);
    if (restaurant_data === undefined) {
        logger.info("Something went horribly wrong!");
        response.redirect("/");
    }
    if (request.session.rated_restaurants !== undefined) {
        already_rated = request.session.rated_restaurants.includes(parseInt(rest_id));
    } else already_rated = false;
    logger.info(already_rated);
    logger.info(request.session.rated_restaurants);

    let dishes =  await dish_store.get_dishes(rest_id);
    let ratings = await restaurant_store.get_restaurant_ratings(rest_id);
    
    return {
        title: "restaurant "+restaurant_data.name,
        restaurant_name: restaurant_data.name,
        restaurant_image: "/images/restaurants"+restaurant_data.image,
        restaurant_dishes: dishes !== undefined? dishes : [],
        show_restaurant_stars: ratings[1] !== undefined,
        restaurant_stars: ratings[1],
        restaurant_ratings: ratings[0],
        restaurant_id: request.params.id,
        signed_in: request.session.user_id !== undefined,
        name: request.session.name,
        surname: request.session.surname,
        already_rated: already_rated
    }
}

const restaurant = {
    async index(request, response){
        let rest_id = request.params.id;
        let base_url = "/restaurant/"+rest_id;
        request.session.last_url = base_url;
        let rate_link = base_url+"/rate";
        let add_link = base_url+"/add_dish";

        let viewData = await make_view_data(request, response, rest_id);
        viewData.rate = (request.path === rate_link && !already_rated);
        viewData.rate_link = rate_link;
        viewData.add_dish = (request.path === add_link);
        viewData.add_link = add_link;
        response.render("restaurant", viewData);
    },

    async add_rating(request, response) {
        let rest_id = request.params.id;
        //add rating into the database

        //render same restaurant again
        let restaurant_data = get_restaurant_info(rest_id, request);
        request.session.rated_restaurants.push(rest_id);
        if (request.session.rated_restaurants != undefined) {
            already_rated = request.session.rated_restaurants.includes(rest_id);
        } else already_rated = false;
        let viewData = await make_view_data(request, response, rest_id);
        viewData.rate = false,
        response.render("restaurant", viewData)
    },

    async add_dish(request, response) {
        let rest_id = request.params.id;
        //save the new dish into the database

        //render the same restaurant again
        let base_url = "/restaurant/"+rest_id
        request.session.last_url = base_url;
        let rate_link = base_url+"/rate";
        let add_link = base_url+"/add_dish";
        if (request.session.rated_restaurants != undefined) {
            already_rated = request.session.rated_restaurants.includes(rest_id);
        } else already_rated = false;
        let viewData = await make_view_data(request, response, rest_id); 
        viewData.rate = (request.path === rate_link && !already_rated),
        viewData.rate_link = rate_link,
        viewData.add_dish = false,
        response.render("restaurant", viewData)
    }
};

module.exports = restaurant;