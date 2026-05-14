const logger = require("../utils/logger.js");

function get_dishes_restaurant(id) {
    if (id == 1) {
        return [
            {dish_name: "Pizza Margherita", dish_picture: "/images/dishes/1/1.png", price: "5.99", description: "Tomato Sauce, Mozzarella", avg_rating: 4.5},
            {dish_name: "Pizza Tonno", dish_picture: "/images/dishes/1/2.png", price: "7.99", description: "Tomato Sauce, Mozzarella, Tuna, Onions", avg_rating: 5}
        ]
    } else if (id == 2) {
        return [
            {dish_name: "Nudeln rot weiß", dish_picture: "/images/dishes/2/1.png", price: "3.99", description: "Noodles with Ketchup and Mayonnaise", avg_rating: 1.5},
        ]
    } else if (id == 3) {
        return [
            {dish_name: "soup soup soup", dish_picture: "/images/dishes/3/1.png", price: "9.99", description: "Special Soup... Let us surprise you!", avg_rating: 3},
        ]
    } else return []
}

function get_restaurant_info(id) {
    if (id == 1) {
        return {
            restaurant_name: "Luigis Pizzeria",
            restaurant_image: "/images/restaurants/1.png",
            restaurant_dishes: get_dishes_restaurant(id),
            restaurant_stars: 4.5
        }
    } else if (id == 2) {
        return {
            restaurant_name: "Marios Nudel Restaurant",
            restaurant_image: "/images/restaurants/2.png",
            restaurant_dishes: get_dishes_restaurant(id),
            restaurant_stars: 3
        }
    } else if (id == 3) {
        return {
            restaurant_name: "Gumbat Rakete",
            restaurant_image: "/images/restaurants/no_image.png",
            restaurant_dishes: get_dishes_restaurant(id),
            restaurant_stars: 1.5
        }
    } else return {};
}

const restaurant = {
    index(request, response){
        request.session.last_url = "/restaurant/"+request.params.id;
        let restaurant_data = get_restaurant_info(request.params.id);
        const viewData = {
            title: "restaurant "+restaurant_data.restaurant_name,
            restaurant_name: restaurant_data.restaurant_name,
            restaurant_image: restaurant_data.restaurant_image,
            restaurant_dishes: restaurant_data.restaurant_dishes,
            restaurant_stars: restaurant_data.restaurant_stars,
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
        }
        response.render("restaurant", viewData)
    },
};

module.exports = restaurant;