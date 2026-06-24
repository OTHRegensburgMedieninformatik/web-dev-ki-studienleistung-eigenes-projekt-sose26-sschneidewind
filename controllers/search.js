const logger = require("../utils/logger");
const dish_store = require("../models/dish_store.js");
const rest_store = require("../models/restaurant_store.js");
const helper = require("../utils/helpers.js");
const restaurant_store = require("../models/restaurant_store.js");

function stars_object(checked_num) { //get an array that is false except for the number that is currently checked, i.e. checked_num = 4 => [false, true, false, false, false]
    let arr = []
    for (let i = 5; i>0; --i){
        arr.push({number: i, checked: checked_num === i})
    }
    return arr;
}

const search = {
    index(request, response) {
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            rest_star_options: stars_object(0),
            dish_star_options: stars_object(0),
            initial: true,
        }
        response.render("search", viewData)
    },

    async search(request, response) {
        const params = request.body;
        const query = params.query.toLowerCase();
        //Boolean values of check-boxes and radio nodes
        const get_restaurants = request.body.restaurant_box === "true";
        const get_dishes = request.body.dish_box === "true";

        let rest_star_filter = request.body.rest_stars !== undefined;
        const min_rest_stars = rest_star_filter ? parseInt(request.body.rest_stars) : -1;
        if (min_rest_stars === -1) rest_star_filter = false;

        let dish_star_filter = request.body.dish_stars !== undefined;
        const min_dish_stars = dish_star_filter ? parseInt(request.body.dish_stars) : -1;
        if (min_dish_stars === -1) dish_star_filter = false;

        const rests = await rest_store.get_all_restaurants();
        const dishes = await dish_store.get_all_dishes();

        logger.info(params);

        let rest_results = []
        if (get_restaurants) {
            for (var i = 0, size = rests.length; i<size; ++i) {
                let row = rests[i]; 
                const keywords = await rest_store.get_keywords(row.id)
                let keywords_list_lower = keywords ? keywords.map(row => row.keyword.toLowerCase()) : [];
                let keywords_list = keywords ? keywords.map(row => row.keyword) : [];
                if (
                    (row.name.toLowerCase().includes(query))
                    ||
                    keywords_list_lower.includes(query)
                ) {
                    let ratings = await rest_store.get_restaurant_ratings(row.id);
                    if (rest_star_filter && ratings !== undefined) { //we have a filter and the restaurant has ratings
                        if (ratings[1] >= min_rest_stars) { //then only take if it satisfies the min_ratings
                            row = {...row, keywords: helper.extract_keywords(keywords_list), rating: ratings[1]};
                            rest_results.push(row);
                        } //case if we have a filter and the restaurant has no ratings handled implicitly, it's not added
                    } else if (!rest_star_filter) { //if we do not have a filter, just add the restaurant
                        row = {...row, keywords: helper.extract_keywords(keywords_list), rating: ratings ? ratings[1] : undefined};
                        rest_results.push(row);
                    }
                }
            }
        }

        let dish_results = [];
        if (get_dishes) {
            for (var i = 0, size = dishes.length; i<size; ++i) {
                let row = dishes[i];
                if (row.name.toLowerCase().includes(query)) {
                    let ratings = await dish_store.get_dish_ratings(row.r_id, row.d_id);
                    let restaurant = await restaurant_store.get_restaurant(row.r_id);
                    if (dish_star_filter && ratings !== undefined) { //logic see above, but this time with handling of restaurant error (however that may come)
                        if (ratings[1] >= min_dish_stars) {
                            if (restaurant) //add the information of the restaurant of the dish into the dish row
                                row = {...row, rating: ratings ? ratings[1] : undefined, rest_name: restaurant.name, street: restaurant.street, postal_code: restaurant.postal_code, city: restaurant.city};
                            else 
                                row = {...row, rating: ratings ? ratings[1] : undefined, rest_name: "Unknown", street: "Weird, no known Address", postal_code: "", city: ""};
                            dish_results.push(row);
                        }
                    } else if (! dish_star_filter) {
                        if (restaurant) 
                            row = {...row, rating: ratings ? ratings[1] : undefined, rest_name: restaurant.name, street: restaurant.street, postal_code: restaurant.postal_code, city: restaurant.city};
                        else 
                            row = {...row, rating: ratings ? ratings[1] : undefined, rest_name: "Unknown", street: "Weird, no known Address", postal_code: "", city: ""};
                        dish_results.push(row);
                    }
                }
            }
        }
        if (rest_results.length === 0) rest_results = undefined;
        if (dish_results.length === 0) dish_results = undefined;

        logger.info(dish_results);
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            search_string: params.query,
            restaurants: rest_results,
            dishes: dish_results,
            searched: true,
            dish_box_checked : get_dishes,
            rest_box_checked : get_restaurants,
            rest_star_options: stars_object(min_rest_stars),
            dish_star_options: stars_object(min_dish_stars),
            no_results_allowed : (!get_dishes) && (!get_restaurants),
            rest_checked_irr: !rest_star_filter,
            dish_checked_irr: !dish_star_filter
        }
        response.render("search", viewData);
    }
};

module.exports = search;