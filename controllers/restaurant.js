const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");
const helper = require("../utils/controller_helper.js");

const restaurant = {
    async index(request, response){
        let rest_id = request.params.id;
        let base_url = "/restaurant/"+rest_id;
        request.session.last_url = base_url;
        let rate_link = base_url+"/rate";
        let add_link = base_url+"/add_dish";

        //getting restaurant data and terminating if there is no restaurant data as well as ratings data
        let restaurant_data = await restaurant_store.get_restaurant(rest_id);
        if (restaurant_data === undefined) {
            logger.info("Something went horribly wrong!");
            return response.redirect("/");
        }
        let keywords = await restaurant_store.get_keywords(rest_id);
        let keywords_list = keywords ? keywords.map(row => row.keyword) : [];
        let keyword_string = helper.extract_keywords(keywords_list);

        let dishes =  await restaurant_store.get_dishes(rest_id);
        let ratings = await restaurant_store.get_restaurant_ratings(rest_id);
        const combined = dishes !== undefined ? 
            dishes.map(row => //go over each row
                ({ ...row, //get all the parameters of the row
                    dish_ratable : request.session.rated_dishes !== undefined ?  //add a new parameter called dish_ratable which is false if rated_dishes of the session is undefined
                        !(request.session.rated_dishes.some(([r_id, d_id]) => r_id == row.r_id && d_id == row.d_id)) //evaluate if there is a r_id d_id combo inside rated dishes
                        : false
                })
            ) : [];
        
        //logic helper for the viewData
        let already_rated = false;
        if (request.session.rated_restaurants !== undefined)
            already_rated = request.session.rated_restaurants.includes(parseInt(rest_id));
        const ratings_exist = ratings !== undefined;

        const viewData = {
            //restaurant data
            title: "restaurant "+restaurant_data.name,
            restaurant_name: restaurant_data.name,
            restaurant_address: restaurant_data.street + ", " + restaurant_data.postal_code + " " + restaurant_data.city,
            restaurant_keywords: keyword_string,
            restaurant_image: "/images/restaurants"+restaurant_data.image,
            restaurant_dishes: combined,

            //rating data
            ratings_exist: ratings_exist,
            restaurant_stars: ratings_exist ? ratings[1] : -1,
            restaurant_ratings: ratings_exist ? ratings[0] : [],

            //user data
            restaurant_id: request.params.id,
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,

            //logic stuff
            show_rate_button : !already_rated && request.session.signed_in,
            rate : (request.path === rate_link) && (!already_rated),
            rate_link : rate_link,
            dish_addable : (request.path !== add_link) && request.session.signed_in, //needs to be protected because is true else
            adding_dish : request.path === add_link, //only accessible if authenticated so needs no extra protection
            add_link : add_link,
        }
        response.render("restaurant", viewData);
    },

    async add_rating(request, response) {
        //persist the rating into the database
        let rest_id = request.params.id;
        let rating = request.body;
        logger.info("The rating to add is:")
        logger.info(rating);
        restaurant_store.rate_restaurant(request.session.user_id, rest_id, rating);
        //add the rated restaurant into the currently rated restaurants so we do not have to do another database query
        request.session.rated_restaurants.push(parseInt(rest_id)); //set current restaurant rated to true
        //render same restaurant again
        let base_url = "/restaurant/" + rest_id;
        response.redirect(base_url);
    },

    async add_dish(request, response) {
        let rest_id = request.params.id;
        let dish = request.body;
        //save the new dish into the database
        logger.info("The dish to add is:");
        logger.info(request.body);
        restaurant_store.add_dish(dish, rest_id);
        request.path = "/restaurant/"+rest_id;
        //render the same restaurant again
        let base_url = "/restaurant/" + rest_id
        response.redirect(base_url);    
    },

    async show_add_restaurant(request, response) {
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname
        };
        response.render("add_restaurant", viewData)
    },

    async add_restaurant(request, response) {
        const restaurant = request.body;
        const keywords = String(request.body.keywords).split(",").map(s => s.trim());
        let viewData = {
            rest_name : restaurant.rest_name,
            street : restaurant.street,
            postal_code: restaurant.postal_code,
            city : restaurant.city,
            country : restaurant.country,
            keywords : request.body.keywords,

            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname
        };
        logger.info(keywords);
        if (keywords.length < 3) { //not enough keywords provided
            viewData.error = true;
            viewData.error_msg = "Error: Please insert at least 3 Keywords!";        
            return response.render("add_restaurant", viewData)
        } else if (await restaurant_store.get_restaurant_id(restaurant) !== undefined){ //this restaurant already exists!
            viewData.error = true;
            viewData.error_msg = "Error: This restaurant already exists!";
            return response.render("add_restaurant", viewData)
        }

        const rest_response = await restaurant_store.add_restaurant(restaurant, keywords);        
        if (rest_response[0] == 1) { //inserting restaurant returned error
            viewData.error = true;            
            viewData.error_msg = rest_response[1];
            return response.render("add_restaurant", viewData)
        } else { //correctly inserted, special case: returns restaurant id in the second rest_response element
            let base_url = "/restaurant/" + rest_response[1];
            response.redirect(base_url);
        }
    },

    async delete_rating(request, response) {
        const user_id = request.params.user_id;
        const rest_id = request.params.restaurant_id;
        logger.info("Deleting rating for restaurant "+rest_id);
        if (parseInt(user_id) !== request.session.user_id) { //if user a tries to delete a rating of user b
            logger.info(user_id);
            logger.info(request.session.user_id);
            return response.redirect("/");
        }
        
        const resp = await restaurant_store.delete_rating(user_id, rest_id);
        if (resp[0] === 0) {
            request.session.rated_restaurants = request.session.rated_restaurants.filter(x => x !== parseInt(rest_id));
        } else {
            logger.info("There was an error:");
            logger.info(resp[1])
        }
        response.redirect("/profile");
    },
};

module.exports = restaurant;