const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

//getter return undefined or the object, writer / adder return an array with first element 0 if fine and 1 if error and second element the error message

const restaurant_store = {
    async add_restaurant(restaurant) {
        const query = "insert into restaurants(name, street, postal_code, city, country) values ($1, $2, $3, $3, $5)";
        const values = [restaurant.name, restaurant.street, restaurant.postal_code, restaurant.city, restaurant.country];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch (e) {
            logger.info("adding restaurant returned error "+e);
            return [1,e];
        }
    },

    async get_restaurant(id) {
        const query = "select * from restaurants where id=$1";
        const values = [id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows[0];
            } else {
                logger.info("There was no restaurant with id = "+id);
                return undefined;
            }
        } catch(e) {
            logger.info("oh no, getting the restaurant "+id+" returned error "+e);
            return undefined;
        }
    },

    async get_restaurant_ratings(rest_id) {
        const query1 = "select * from restaurant_ratings join users on restaurant_ratings.u_id = users.id where r_id=$1";
        const query2 = "select avg(stars) as avg_stars from restaurant_ratings where r_id=$1 group by r_id"
        const values = [rest_id];
        try {
            let response1 = await dataStoreClient.query(query1, values);
            let response2 = await dataStoreClient.query(query2, values);
            if (response1.rows[0] !== undefined) { //the dish exists and there is at least one rating
                return [response1.rows.map(row => ({...row, time: new Date(row.time).toLocaleDateString('de-DE', {day:'2-digit', month: '2-digit', year:'numeric'})})), parseFloat(response2.rows[0].avg_stars)];
            } else {
                logger.info("Error, ratings for the restaurant "+rest_id+" were not found!");
                return undefined;
            }
        } catch(e) {
            logger.info("Getting restaurant "+rest_id+" returned an error: "+e);
            return undefined;
        }
    },


    async rate_restaurant(user_id, rest_id, rating) {
        const query = "insert into restaurant_ratings(u_id, r_id, stars, text) values ($1, $2, $3, $4)";
        const values = [user_id, rest_id, rating.number_of_stars, rating.text];
        try {
            let response = await dataStoreClient.query(query, values);
            return [0,0];
        } catch (e) {
            logger.info("Error rating restaurant "+rest_id+" for user "+user_id+": "+e)
            return [1,e];
        }
    },

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

    async delete_rating(user_id, rest_id) {
        const query = "delete from restaurant_ratings where u_id=$1 and r_id=$2"
        const values = [user_id, rest_id];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch(e) {
            logger.info("Deleting Rating for the restaurant "+rest_id+" by user "+user_id+"Returned error "+e);
            return [1,e];
        }
    },
}

module.exports = restaurant_store;