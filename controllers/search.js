const logger = require("../utils/logger");
const dish_store = require("../models/dish_store.js");
const rest_store = require("../models/restaurant_store.js");

const search = {
    index(request, response) {
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            searched: false
        }
        response.render("search", viewData)
    },

    async search(request, response) {
        const params = request.body;
        const rests = await rest_store.get_all_restaurants();
        const dishes = await dish_store.get_all_dishes();
        logger.info(rests[0]);
        logger.info(dishes[0]);
        logger.info(params);
        let rest_results = []
        for (var i = 0, size = rests.length; i<size; ++i) {
            const row = rests[i]; 
            const keywords = await rest_store.get_keywords(row.id)
            let keywords_list = keywords ? keywords.map(row => row.keyword) : [];
            logger.info(row.name.toLowerCase())
            logger.info(row.name.toLowerCase().includes(params.query.toLowerCase()))
            if (
                (row.name.toLowerCase().includes(params.query.toLowerCase()))
                ||
                keywords_list.includes(params.query.toLowerCase())
            ) {
                rest_results.push(row);
            }
        }
        logger.info(rest_results);

        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            searched: false
        }
        response.render("search", viewData);
    }
};

module.exports = search;