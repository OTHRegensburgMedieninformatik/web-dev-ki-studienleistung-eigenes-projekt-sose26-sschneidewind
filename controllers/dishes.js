const logger = require("../utils/logger.js");

function get_dish_info(rest_id, dish_id) {
    if (rest_id==1) {
        if (dish_id == 1) 
            return {rest_name: "Luigis Pizzeria", dish_name: "Pizza Margherita", dish_picture: "/images/dishes/1/1.png", price: "5.99", description: "Tomato Sauce, Mozzarella", avg_rating: 4.5, restaurant_stars: 4.5};
        else 
            return {rest_name: "Luigis Pizzeria", dish_name: "Pizza Tonno", dish_picture: "/images/dishes/1/2.png", price: "7.99", description: "Tomato Sauce, Mozzarella, Tuna, Onions", avg_rating: 5, restaurant_stars: 4.5}
    } else if (rest_id == 2) 
        return {rest_name: "Marios Nudel Restaurant", dish_name: "Nudeln rot weiß", dish_picture: "/images/dishes/2/1.png", price: "3.99", description: "Noodles with Ketchup and Mayonnaise", avg_rating: 1.5, restaurant_stars: 3}
    else if (rest_id == 3) 
        return {rest_name: "Gumbat Rakete", dish_name: "soup soup soup", dish_picture: "/images/dishes/3/1.png", price: "9.99", description: "Special Soup... Let us surprise you!", avg_rating: 3, restaurant_stars: 2}
}

const dishes = {
    index(request, response) {
        let dish_id = request.params.dish_id;
        let rest_id = request.params.restaurant_id;
        let information = get_dish_info(rest_id, dish_id);
        request.session.last_url = "restaurant/"+rest_id+"/dish/"+dish_id;
        let rate_link = "/restaurant/"+rest_id+"/dish/"+dish_id+"/rate";

        if (request.session.rated_restaurants != undefined) {
            rest_already_rated = request.session.rated_restaurants.includes(rest_id);
        } else rest_already_rated = false;

        if (request.session.rated_dishes != undefined) {
            dish_already_rated = request.session.rated_dishes.some(([r_id, d_id]) => r_id == rest_id && d_id == dish_id);
        } else dish_already_rated = false;

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