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

        let keywords = await rest_store.get_keywords(rest_id);
        logger.info(keywords);
        let keyword_string = ""
        if (keywords !== undefined) {
            keyword_string = keywords[0].keyword;
            for (var i = 1, size = keywords.length; i<size; i++) {
                keyword_string += ", " + keywords[i].keyword;
            }
        }

        //terminate if the specified restaurant or dish does not exist
        if (dish_information === undefined || rest_information === undefined)
            response.redirect("/");

        logger.info("INFO")
        logger.info(dish_ratings)
        logger.info(rest_ratings)
        let rate_link = "/restaurant/"+rest_id+"/dish/"+dish_id+"/rate";
        request.session.last_url = "restaurant/"+rest_id+"/dish/"+dish_id;

        if (request.session.rated_restaurants !== undefined) {
            rest_already_rated = request.session.rated_restaurants.includes(rest_id);
        } else rest_already_rated = false;

        if (request.session.rated_dishes !== undefined) {
            dish_already_rated = request.session.rated_dishes.some(([r_id, d_id]) => r_id == rest_id && d_id == dish_id);
        } else dish_already_rated = false;

        const dish_ratings_exist = dish_ratings !== undefined;
        const rest_ratings_exist = rest_ratings !== undefined;

        const dish_rateable = request.session.rated_dishes ? !request.session.rated_dishes.some(([r_id, d_id]) => rest_id == r_id && dish_id == d_id): false;
        const rest_rateable = request.session.rated_restaurants ? !request.session.rated_restaurants.includes(parseInt(rest_id)) : false;

        const viewData = {
            //basic information concerning dish
            title: "Dish "+dish_information.name,
            dish_id: dish_id,
            rest_id: rest_id,
            dish_name: dish_information.name,
            rest_name: rest_information.name,
            keywords: keyword_string,
            rest_address: rest_information.street + ", " + rest_information.postal_code + " " + rest_information.city,
            dish_image: "/images/dishes"+dish_information.image,
            price: dish_information.price,
            description: dish_information.description,
            
            //for the ratings
            dish_ratings_exist : dish_ratings_exist,
            dish_stars: dish_ratings_exist ? dish_ratings[1] : 0,
            dish_ratings: dish_ratings_exist ? dish_ratings[0] : null,
            rest_ratings_exist : rest_ratings_exist,
            rest_stars: rest_ratings_exist ? rest_ratings[1] : 0,
            dish_rateable : dish_rateable,
            rest_rateable : rest_rateable,
            currently_rating : (request.path === rate_link) && (dish_rateable),
            rate_link: rate_link,

            //basic information concerning user
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
        }
        logger.info(request.session.rated_dishes);
        response.render("dish", viewData);
    },

    add_rating(request, response) {
        let dish_id = request.params.dish_id;
        let rest_id = request.params.restaurant_id;
        let base_url = "/restaurant/"+rest_id+"/dish/"+dish_id

        let rating = request.body;
        logger.info("The rating to add is:")
        logger.info(rating);
        dish_store.rate_dish(request.session.user_id, rest_id, dish_id, rating)
        request.session.rated_dishes.push([rest_id, dish_id]);

        response.redirect(base_url);
    },

    async delete_rating(request, response) {
        const user_id = request.params.user_id;
        const rest_id = request.params.restaurant_id;
        const dish_id = request.params.dish_id;
        logger.info("Deleting rating for restaurant "+rest_id+ " and dish "+dish_id);
        if (parseInt(user_id) !== request.session.user_id) { //if user a tries to delete a rating of user b
            return response.redirect("/");
        }
        
        const resp = await dish_store.delete_rating(user_id, rest_id, dish_id);
        if (resp[0] === 0) {
            request.session.rated_dishes = request.session.rated_dishes.filter(([r_id, d_id]) => !(parseInt(r_id) === parseInt(rest_id) && parseInt(d_id) === parseInt(dish_id)));
        } else {
            logger.info("There was an error:");
            logger.info(resp[1])
        }
        logger.info(request.session.rated_dishes);
        response.redirect("/profile");
    },
}

module.exports = dishes;