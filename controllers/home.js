const logger = require("../utils/logger.js");

const home = {
  index(request, response) {
    logger.info("home rendering");
    const viewData = {
      title: "Critical Restaurant",
      signed_in: request.session.signed_in
    };
    response.render("home", viewData);
  },
};

module.exports = home;
