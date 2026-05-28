const logger = require("../utils/logger.js");
const restaurant_store = require("../models/restaurant_store.js");

async function make_view_data(request, response, rest_id) {
    let restaurant_data = await restaurant_store.get_restaurant(rest_id);
    if (restaurant_data === undefined) {
        logger.info("Something went horribly wrong!");
        response.redirect("/");
    }
    let already_rated = false;
    if (request.session.rated_restaurants !== undefined)
        already_rated = request.session.rated_restaurants.includes(parseInt(rest_id));
    logger.info(already_rated);
    logger.info(request.session.rated_restaurants);

    let dishes =  await restaurant_store.get_dishes(rest_id);
    let ratings = await restaurant_store.get_restaurant_ratings(rest_id);
    const combined = dishes !== undefined ? 
        dishes.map(row => //go over each row
            ({ ...row, //get all the parameters of the row
                dish_ratable : request.session.rated_dishes !== undefined ?  //add a new parameter called dish_rated which is false if rated_dishes of the session is undefined
                    !(request.session.rated_dishes.some(([r_id, d_id]) => r_id == row.r_id && d_id == row.d_id)) //evaluate if there is a r_id d_id combo inside of the rated dishes
                    : false
            })
        ) : [];
    logger.info(combined);
    
    const ratings_exist = ratings !== undefined;

    return {
        title: "restaurant "+restaurant_data.name,
        restaurant_name: restaurant_data.name,
        restaurant_image: "/images/restaurants"+restaurant_data.image,
        restaurant_dishes: combined,
        show_restaurant_stars: ratings_exist ? ratings[1] !== undefined : false,
        restaurant_stars: ratings_exist ? ratings[1] : -1,
        restaurant_ratings: ratings_exist ? ratings[0] : [],
        restaurant_id: request.params.id,
        signed_in: request.session.signed_in,
        name: request.session.name,
        surname: request.session.surname,
        show_rate_button : !already_rated && request.session.signed_in,
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
        
        let already_rated = false;
        if (request.session.rated_restaurants !== undefined)
            already_rated = request.session.rated_restaurants.includes(parseInt(rest_id));

        viewData.rate = (request.path === rate_link && !already_rated);
        viewData.rate_link = rate_link;
        viewData.dish_addable = (request.path !== add_link) && request.session.signed_in; //needs to be protected because is true else
        viewData.adding_dish = request.path === add_link; //only accessible if authenticated so needs no extra protection
        viewData.add_link = add_link;
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