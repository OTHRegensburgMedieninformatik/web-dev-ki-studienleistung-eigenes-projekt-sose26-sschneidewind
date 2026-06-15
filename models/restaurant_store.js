const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

//getter return undefined or the object, writer / adder return an array with first element 0 if fine and 1 if error and second element the error message

const restaurant_store = {
    async add_restaurant(restaurant) {
        logger.info(restaurant);
        const query = "insert into restaurants(name, street, postal_code, city, country, image) values ($1, $2, $3, $4, $5, $6)";
        const values = [restaurant.rest_name, restaurant.street, restaurant.postal_code, restaurant.city, restaurant.country, restaurant.image ? restaurant.image : "/no_image.png"];
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

    async get_keywords(id) {
        const query = "select * from keywords where r_id=$1";
        const values = [id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows;
            } else {
                logger.info("There were no keywords for restaurant with id = "+id);
                return undefined;
            }
        } catch(e) {
            logger.info("oh no, getting the keywords for restaurant "+id+" returned error "+e);
            return undefined;
        }
    },

    async add_keywords(keyword_list, rest_id) {
        const query = "insert into keywords(r_id, keyword) values ($1, $2)";
        logger.info(keyword_list);
        for (let i = 0; i<keyword_list.length; ++i) {
            values = [rest_id, keyword_list[i]];
            logger.info(values);
            try {
                let response = await dataStoreClient.query(query, values);
            } catch (e) {
                logger.info("Inserting keyword "+keyword_list[i]+" returned "+e);
                return [1,e];
            }
        }
        return [0,0];
    },

    async get_restaurant_id(restaurant) {
        const query = "select id from restaurants where name = $1 and street = $2 and postal_code = $3";
        const values = [restaurant.rest_name, restaurant.street, restaurant.postal_code];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows[0].id;
            } else {
                logger.info("Getting rest_id for restaurant "+restaurant.rest_name+" was not successfull!");
                return undefined;
            } 
        } catch(e) {
            logger.info("Getting rest_id for restaurant "+restaurant.rest_name+" returned error: " + e);
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

    async get_top_restaurants(user_id) {
        const not_logged_in = user_id === undefined;
        const query = not_logged_in? 
            "select row_number() over (order by avg(stars) desc nulls last) as rank, id, avg(stars) as stars, name, city from restaurant_ratings right join restaurants on restaurant_ratings.r_id = restaurants.id group by restaurants.id, restaurants.name order by stars desc nulls last limit 5"
            :
            "with user_row as (select * from users where id=$1) select row_number() over (order by avg(stars) desc nulls last) as rank, restaurants.id, avg(stars) as stars, restaurants.name, restaurants.city from restaurant_ratings right join restaurants on restaurant_ratings.r_id = restaurants.id join user_row on restaurants.postal_code = user_row.postal_code or restaurants.city = user_row.city group by restaurants.id, restaurants.name order by stars desc nulls last limit 5";
        const values = not_logged_in ? [] : [user_id]
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows;
            } else {
                logger.info("Error, there were no restaurants!");
                return undefined;
            }
        } catch (e){
            logger.info("Getting current best restaurants returned an error: "+e);
            return undefined;
        }
    },

    async get_all_restaurants() {
        const query = "select id, name, street, postal_code, city from restaurants";
        const values = [];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows;
            } else {
                logger.info("Error, there were no restaurants!");
                return undefined;
            }
        } catch (e){
            logger.info("Getting restaurants returned an error: "+e);
            return undefined;
        }
    }
}

module.exports = restaurant_store;