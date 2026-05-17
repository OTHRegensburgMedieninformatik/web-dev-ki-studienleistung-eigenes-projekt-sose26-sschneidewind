const dataStore = require("./data_store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

const user_store = {
    async add_user(user) {
        const query = "insert into users(email, name, surname, street, city, country, password) values ($1, $2, $3, $4, $5, $6, $7)";
        const values = [user.email, user.name, user.surname, user.street, user.city, user.country, user.password];
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
            } else return undefined
        } catch (e) {
            logger.info("error: authenticating returned "+e);
        }
    },

    async change_attributes(user) {
        const final_email = user.newEmail !== '' ? user.newEmail : user.email;
        const final_password = user.newPassword !== '' ? user.newPassword : user.password;
        const query = "UPDATE users SET email=$1, name=$2, surname=$3, street=$4, city=$5, country=$6, password=$7 WHERE email=$8";
        const values = [final_email, user.name, user.surname, user.street, user.city, user.country, final_password, user.email];
        try {
            let response = await dataStoreClient.query(query, values);
            return [0,0];
        } catch (e) {
            logger.info("adjusting user information returned error: "+e);
            return [1,e];
        }
    }

};

module.exports = user_store;