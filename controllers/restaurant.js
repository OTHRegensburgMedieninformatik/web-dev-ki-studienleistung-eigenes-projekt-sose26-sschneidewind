const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");

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
            response.redirect("/");
        }
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
        logger.info(combined);
        
        //logic helper for the viewData
        let already_rated = false;
        if (request.session.rated_restaurants !== undefined)
            already_rated = request.session.rated_restaurants.includes(parseInt(rest_id));
        const ratings_exist = ratings !== undefined;

        const viewData = {
            //restaurant data
            title: "restaurant "+restaurant_data.name,
            restaurant_name: restaurant_data.name,
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
    }
};

module.exports = restaurant;