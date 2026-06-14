const logger = require("../utils/logger");
const dish_store = require("../models/dish_store.js");
const rest_store = require("../models/restaurant_store.js");
const helper = require("../utils/controller_helper.js");

const search = {
    index(request, response) {
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            initial: true,
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
            let row = rests[i]; 
            const keywords = await rest_store.get_keywords(row.id)
            let keywords_list_lower = keywords ? keywords.map(row => row.keyword.toLowerCase()) : [];
            let keywords_list = keywords ? keywords.map(row => row.keyword) : [];
            if (
                (row.name.toLowerCase().includes(params.query.toLowerCase()))
                ||
                keywords_list_lower.includes(params.query.toLowerCase())
            ) {
                let ratings = await rest_store.get_restaurant_ratings(row.id);
                row = {...row, keywords: helper.extract_keywords(keywords_list), rating: ratings ? ratings[1] : undefined};
                rest_results.push(row);
            }
        }
        if (rest_results.length === 0) rest_results = undefined;
        logger.info(rest_results);
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
            search_string: params.query,
            restaurants: rest_results,
            searched: true
        }
        response.render("search", viewData);
    }
};

module.exports = search;