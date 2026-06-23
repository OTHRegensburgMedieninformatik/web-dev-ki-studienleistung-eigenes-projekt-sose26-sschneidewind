const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

const user_store = {
    async add_user(user) {
        const query = "insert into users(email, name, surname, street, postal_code, city, country, password) values ($1, $2, $3, $4, $5, $6, $7, $8)";
        const values = [user.email, user.name, user.surname, user.street, user.postal_code, user.city, user.country, user.password];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch (e) {
            logger.info("adding user returned error "+e);
            return [1, e];
        }
    },
    
    async authenticate(email, password) { //if authenticated correctly returns the information, else undefined
        const query = "select  * from users where email=$1 and password = $2";
        const values = [email, password];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows[0];
            } else {
                logger.info("User with email "+email+" was not found");
                return undefined;
            }
        } catch (e) {
            logger.info("error: authenticating returned "+e);
            return undefined;
        }
    },

    async change_attributes(user) {
        const final_email = user.newEmail !== '' ? user.newEmail : user.email;
        const final_password = user.newPassword !== '' ? user.newPassword : user.password;
        const query = "UPDATE users SET email=$1, name=$2, surname=$3, postal_code=$4, street=$5, city=$6, country=$7, password=$8 WHERE email=$9";
        const values = [final_email, user.name, user.surname, user.postal_code, user.street, user.city, user.country, final_password, user.email];
        try {
            let response = await dataStoreClient.query(query, values);
            return [0,0];
        } catch (e) {
            logger.info("adjusting user information returned error: "+e);
            return [1,e];
        }
    },

    async get_user_dish_or_restaurant_ratings(user_id, get_dish) {
        let dish_query = "select dishes.r_id as rest_id, dishes.d_id as dish_id, stars, text as string, time, restaurants.name as restaurant, dishes.name as dish from dish_ratings join dishes on (dish_ratings.d_id = dishes.d_id) and (dish_ratings.r_id = dishes.r_id) join restaurants on dish_ratings.r_id = restaurants.id where u_id=$1;" //funny double join to get the name of the restaurant as well as the name of the dish as both are stored in different tables
        let rest_query = "select r_id as rest_id, stars, text as string, time, name as restaurant from restaurant_ratings join restaurants on restaurant_ratings.r_id = restaurants.id where u_id=$1"
        const query = get_dish ? dish_query : rest_query;
        const values = [user_id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows;
            } else {
                logger.info("There were no lines in the "+(get_dish ? "dish":"restaurant")+ " ratings of user "+user_id);
                return undefined;
            }
        } catch (e) {
            logger.info("There was an error while getting "+(get_dish ? "dish":"restaurant")+ " ratings for user "+user_id+": "+e);
            return undefined;
        }
    },

    async get_user_info(user_id) {
        const query = "select * from users where u_id = $1"
        const values = {user_id};
        try {
            let response = dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows[0];
            } else {
                logger.info("User "+user_id+" was not found");
                return undefined;
            }
        } catch(e) {
            logger.info("Error getting user info for user "+user_id+": "+e);
            return undefined;
        }
    },

    async get_already_rated_dishes_restaurants(user_id) {
        const query = "select r_id, d_id from dish_ratings where u_id=$1";
        const values = [user_id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows.map(row => [row.r_id, row.d_id]); // returns an array of arrays instead of objects, previously would return [{r_id, d_id}, {r_id, d_id}], now returns [[r_id, d_id], [r_id, d_id]]
            } else {
                logger.info("Error: There probably were no current dish-ratings for user "+user_id);
                return undefined;
            }
        } catch(e) {
            logger.info("Error: couldn't get dish ratings for user "+user_id+": "+e);
            return undefined;
        }
    },

    async get_already_rated_restaurants(user_id) {
        const query = "select r_id from restaurant_ratings where u_id=$1";
        const values = [user_id];
        try {
            let response = await dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows.map(row=>row.r_id); //same idea as above, returns [1,2,3] instead of [{r_id: 1}, {r_id: 2}, {r_id: 3}]
            } else {
                logger.info("Error: There were no current restaurant ratings for user "+user_id);
                return undefined;
            }
        } catch(e) {
            logger.info("Error: couldn't get restaurant ratings for user "+user_id+": "+e);
            return undefined;
        }
    },

    async add_and_get_coords(user) {
        try {
            const url = "https://nominatim.openstreetmap.org/search?format=geocodejson&street="+user.street.replaceAll(" ", ".")+"&city="+user.city
            logger.info(url);
            const resp = await fetch(url);
            logger.info(resp);
            const data = await resp.json();
            logger.info(data);
            const lat = data.features[0].geometry.coordinates[1];
            const long = data.features[0].geometry.coordinates[0];
            const query = "UPDATE users SET lat = $2, long = $3 WHERE id = $1";
            const values = [user.id, lat, long];
            let response = await dataStoreClient.query(query, values);
            return [lat, long];
        } catch(e) {
            logger.info("Error: getting the coordinates returned an error!"+e)
            return undefined;
        }
    }
};

module.exports = user_store;