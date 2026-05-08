const logger = require("../utils/logger.js");

const about = {
  index(request, response) {
    logger.info("about rendering");
    const viewData = {
      title: "About Critical Restaurant",
      signed_in: request.session.signed_in
    };
    response.render("about", viewData);
  }
};

module.exports = about;
