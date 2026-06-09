const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

//getter return undefined or the object, writer / adder return an array with first element 0 if fine and 1 if error and second element the error message

const dish_store = {
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
        const query1 = "select * from dish_ratings join users on dish_ratings.u_id = users.id where r_id=$1 and d_id=$2";
        const query2 = "select avg(stars) as avg_stars from dish_ratings where r_id=$1 and d_id=$2 group by d_id"
        const values = [rest_id, dish_id];
        try {
            let response1 = await dataStoreClient.query(query1, values);
            let response2 = await dataStoreClient.query(query2, values);
            if (response1.rows[0] !== undefined) { //the dish exists and there is at least one rating
                return [response1.rows.map(row => ({...row, time: new Date(row.time).toLocaleDateString('de-DE', {day:'2-digit', month: '2-digit', year:'numeric'})})), parseFloat(response2.rows[0].avg_stars)];
            } else {
                logger.info("There are no ratings for the dish "+dish_id+" of restaurant "+rest_id+"!");
                return undefined;
            }
        } catch(e) {
            logger.info("Getting dish "+dish_id+" of restaurant "+rest_id+" returned an error: "+e);
            return undefined;
        }
    },

    async rate_dish(user_id, rest_id, dish_id, rating) {
        const query = "insert into dish_ratings(u_id, r_id, d_id, stars, text) values ($1, $2, $3, $4, $5)";
        const values = [user_id, rest_id, dish_id, rating.number_of_stars, rating.text];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch(e) {
            logger.info("rating dish "+dish_id+" of restaurant "+rest_id+" for user "+user_id+" returned an error: "+e)
            return [1, e];
        }
    },

    async delete_rating(user_id, rest_id, dish_id) {
        const query = "delete from dish_ratings where u_id=$1 and r_id=$2 and d_id=$3"
        const values = [user_id, rest_id, dish_id];
        try {
            await dataStoreClient.query(query, values);
            return [0,0];
        } catch(e) {
            logger.info("Deleting Rating for the dish "+dish_id+" of the restaurant "+rest_id+" by user "+user_id+"Returned error "+e);
            return [1,e];
        }
    },
}

module.exports = dish_store;