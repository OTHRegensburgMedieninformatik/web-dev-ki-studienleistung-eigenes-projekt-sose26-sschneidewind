const logger = require("../utils/logger.js");

const home = {
  index(request, response) {
    logger.info("home rendering, name is: " + request.session.name);
    const viewData = {
      title: "Critical Restaurant",
      signed_in: request.session.signed_in,
      name: request.session.name
    };
    response.render("home", viewData);
  },
};

module.exports = home;
