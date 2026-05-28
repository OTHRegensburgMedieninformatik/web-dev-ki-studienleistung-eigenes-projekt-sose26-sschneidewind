const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

//getter return undefined or the object, writer / adder return an array with first element 0 if fine and 1 if error and second element the error message

const dish_store = {
    async get_dishes(rest_id) {
        const query = "select dishes.r_id, dishes.d_id, dishes.name, dishes.price, dishes.description, dishes.image, avg(dish_ratings.stars) as avg_rating from dishes left join dish_ratings on (dishes.d_id = dish_ratings.d_id) and (dishes.r_id = dish_ratings.r_id) where dishes.r_id=$1 group by dishes.r_id, dishes.d_id, dishes.name, dishes.price, dishes.description, dishes.image"; //query that also gets the star ratings
        const values = [rest_id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows;
            } else {
                logger.info("Error, there were no dishes for restaurant "+rest_id);
                return undefined;
            }
        } catch(e) {
            logger.info("Getting dishes for restaurant "+rest_id+" returned an error: "+e);
            return undefined;
        }
    },

    async get_dish(rest_id, dish_id) {
        const query = "select * from dishes where r_id=$1 and d_id=$2";
        const values = [rest_id, dish_id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows[0];
            } else {
                logger.info("Error, the dish "+dish_id+" of restaurant "+rest_id+" was not found!");
                return undefined;
            }
        } catch(e) {
            logger.info("Getting dish "+dish_id+" of restaurant "+rest_id+" returned an error: "+e);
            return undefined;
        }
    },

    async get_dish_ratings(rest_id, dish_id) {
        const query1 = "select * from dish_ratings where r_id=$1 and d_id=$2";
        const query2 = "select avg(stars) as avg_stars from dish_ratings where r_id=$1 and d_id=$2 group by d_id"
        const values = [rest_id, dish_id];
        try {
            let response1 = await dataStoreClient.query(query1, values);
            let response2 = await dataStoreClient.query(query2, values);
            if (response1.rows[0] !== undefined) { //the dish exists and there is at least one rating
                return [response1.rows, parseFloat(response2.rows[0].avg_stars)];
            } else {
                logger.info("Error, ratings for the dish "+dish_id+" of restaurant "+rest_id+" was not found!");
                return undefined;
            }
        } catch(e) {
            logger.info("Getting dish "+dish_id+" of restaurant "+rest_id+" returned an error: "+e);
            return undefined;
        }
    },

    async add_dish(dish, rest_id) {
        const query = "insert into dishes(name, r_id, d_id, price, description, image) values ($1, $2, (select coalesce(max(d_id),0)+1 from dishes where r_id = $2), $3, $4, $5)"; //I am very happy with this, automatically increments dish_id by one for new insert on restaurant 
        const values = [dish.name, rest_id, dish.price, dish.description, "/no_image.png"];
        try {
            await dataStoreClient.query(query, values);
            return [0,0]
        } catch(e) {
            logger.info("Inserting a dish for restaurant "+rest_id+" returned an error: "+e);
            return [1,e];
        }
    },

    async rate_dish(user_id, rest_id, dish_id, rating) {
        const query = "insert into dish_ratings(u_id, r_id, d_id, stars, text) values ($1, $2, $3, $4, $5)";
        const values = [user_id, rest_id, dish_id, rating.stars, rating.text];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch(e) {
            logger.info("rating dish "+dish_id+" of restaurant "+rest_id+" for user "+user_id+" returned an error: "+e)
            return [1, e];
        }
    },
}

module.exports = dish_store;