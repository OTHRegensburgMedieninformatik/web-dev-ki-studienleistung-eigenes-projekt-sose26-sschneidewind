const logger = require("../utils/logger");

const search = {
    index(request, response) {
        const viewData = {
            signed_in: request.session.signed_in,
            name: request.session.name,
            surname: request.session.surname,
        }
        response.render("search", viewData)
    },
};

module.exports = search;