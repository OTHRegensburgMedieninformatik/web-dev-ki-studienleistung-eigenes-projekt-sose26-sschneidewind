const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");
const dish_store = require("../models/dish_store.js");
const fs = require("fs");
const path = require("path");

function get_dishes_restaurant(rest_id, request) {
    if (rest_id == 1) {
        return [
            {dish_name: "Pizza Margherita", dish_picture: "/images/dishes/1/1.png", price: "5.99", description: "Tomato Sauce, Mozzarella", avg_rating: 4.5, id: 1, dish_rated: request.session.rated_dishes?.some(([r_id, d_id]) => r_id == rest_id && d_id == 1) ?? false},
            {dish_name: "Pizza Tonno", dish_picture: "/images/dishes/1/2.png", price: "7.99", description: "Tomato Sauce, Mozzarella, Tuna, Onions", avg_rating: 5, id: 2, dish_rated: request.session.rated_dishes?.some(([r_id, d_id]) => r_id == rest_id && d_id == 2) ?? false}
        ]
    } else if (rest_id == 2) {
        return [
            {dish_name: "Nudeln rot weiß", dish_picture: "/images/dishes/2/1.png", price: "3.99", description: "Noodles with Ketchup and Mayonnaise", avg_rating: 1.5, id: 1, dish_rated: request.session.rated_dishes?.some(([r_id, d_id]) => r_id == rest_id && d_id == 1) ?? false},
        ]
    } else if (rest_id == 3) {
        return [
            {dish_name: "soup soup soup", dish_picture: "/images/dishes/3/1.png", price: "9.99", description: "Special Soup... Let us surprise you!", avg_rating: 3, id: 1, dish_rated: request.session.rated_dishes?.some(([r_id, d_id]) => r_id == rest_id && d_id == 1) ?? false},
        ]
    } else return []
}

function get_restaurant_info(id, request) {
    if (id == 1) {
        return {
            restaurant_name: "Luigis Pizzeria",
            restaurant_image: "/images/restaurants/1.png",
            restaurant_dishes: get_dishes_restaurant(id, request),
            restaurant_stars: 4.5
        }
    } else if (id == 2) {
        return {
            restaurant_name: "Marios Nudel Restaurant",
            restaurant_image: "/images/restaurants/2.png",
            restaurant_dishes: get_dishes_restaurant(id, request),
            restaurant_stars: 3
        }
    } else if (id == 3) {
        return {
            restaurant_name: "Gumbat Rakete",
            restaurant_image: "/images/restaurants/no_image.png",
            restaurant_dishes: get_dishes_restaurant(id, request),
            restaurant_stars: 1.5
        }
    } else return {};
}

const restaurant = {
    async index(request, response){
        let rest_id = request.params.id;
        let base_url = "/restaurant/"+rest_id;
        request.session.last_url = base_url;
        let rate_link = base_url+"/rate";
        let add_link = base_url+"/add_dish";
        let restaurant_data = await restaurant_store.get_restaurant(rest_id);
        let img_path = path.join(__dirname, "../public/images/restaurants", rest_id+".png");

        if (restaurant_data === undefined) {
            logger.info("Something went horribly wrong!");
            response.redirect("/");
        }

        if (request.session.rated_restaurants !== undefined) {
            already_rated = request.session.rated_restaurants.includes(rest_id);
        } else already_rated = false;

        let dishes =  await dish_store.get_dishes(rest_id);
        let ratings = await restaurant_store.get_restaurant_ratings(rest_id);
        logger.info("image exists:")
        logger.info(dishes);
        const viewData = {
            title: "restaurant "+restaurant_data.name,
            restaurant_name: restaurant_data.name,
            restaurant_image: fs.existsSync(img_path) ? "/images/restaurants/"+rest_id+".png":"/images/restaurants/no_image.png",
            restaurant_dishes: dishes !== undefined? dishes : [],
            show_restaurant_stars: ratings[1] !== undefined,
            restaurant_stars: ratings[1],
            restaurant_ratings: ratings[0],
            restaurant_id: request.params.id,
            signed_in: request.session.user_id !== undefined,
            name: request.session.name,
            surname: request.session.surname,
            rate: (request.path === rate_link && !already_rated),
            rate_link: rate_link,
            add_dish: (request.path === add_link),
            add_link: add_link,
            already_rated: already_rated
        }
        response.render("restaurant", viewData)
    },

    add_rating(request, response) {
        let rest_id = request.params.id;
        //add rating into the database

        //render same restaurant again
        let restaurant_data = get_restaurant_info(rest_id, request);
        request.session.rated_restaurants.push(rest_id);
        if (request.session.rated_restaurants != undefined) {
            already_rated = request.session.rated_restaurants.includes(rest_id);
        } else already_rated = false;
        const viewData = {
            title: "restaurant "+restaurant_data.restaurant_name,
            restaurant_name: restaurant_data.restaurant_name,
            restaurant_image: restaurant_data.restaurant_image,
            restaurant_dishes: restaurant_data.restaurant_dishes,
            restaurant_stars: restaurant_data.restaurant_stars,
            restaurant_id: request.params.id,
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            rate: false,
            already_rated: already_rated
        }
        response.render("restaurant", viewData)
    },

    add_dish(request, response) {
        let rest_id = request.params.id;
        //save the new dish into the database

        //render the same restaurant again
        let base_url = "/restaurant/"+rest_id
        request.session.last_url = base_url;
        let restaurant_data = get_restaurant_info(rest_id, request);
        let rate_link = base_url+"/rate";
        let add_link = base_url+"/add_dish";
        if (request.session.rated_restaurants != undefined) {
            already_rated = request.session.rated_restaurants.includes(rest_id);
        } else already_rated = false;
        const viewData = {
            title: "restaurant "+restaurant_data.restaurant_name,
            restaurant_name: restaurant_data.restaurant_name,
            restaurant_image: restaurant_data.restaurant_image,
            restaurant_dishes: restaurant_data.restaurant_dishes,
            restaurant_stars: restaurant_data.restaurant_stars,
            restaurant_id: request.params.id,
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            rate: (request.path === rate_link && !already_rated),
            rate_link: rate_link,
            add_dish: false,
            already_rated: already_rated
        }
        response.render("restaurant", viewData)
    }
};

module.exports = restaurant;