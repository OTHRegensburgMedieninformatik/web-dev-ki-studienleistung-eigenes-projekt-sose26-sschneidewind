const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

const user_store = {
    async add_user(user) {
        const query = "insert into users(email, name, surname, street, postal_code, city, country, password) values ($1, $2, $3, $4, %5, $6, $7, $8)";
        const values = [user.email, user.name, user.surname, user.street, user.postal_code, user.city, user.country, user.password];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch (e) {
            logger.info("adding user returned error "+e);
            return [1, e];
        }
    },
    
    async authenticate(email, password) {
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

    async get_user_ratings(user_id) {
        const query = "s"
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
            let response = dataStoreClient.query(query, values);
            if (response.rows[0] !== undefined) {
                return response.rows;
            } else {
                logger.info("Error: There probably were no current ratings for user "+user_id);
                return undefined;
            }
        } catch(e) {
            logger.info("Error: couldn't get user "+user_id+": "+e);
            return undefined;
        }
    },

};

module.exports = user_store;