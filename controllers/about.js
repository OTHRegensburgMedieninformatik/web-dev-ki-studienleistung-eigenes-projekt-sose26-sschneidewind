const logger = require("../utils/logger.js");

const about = {
  index(request, response) {
    logger.info("about rendering");
    request.session.last_url = "/about";
    const viewData = {
      title: "About Critical Restaurant",
      signed_in: request.session.signed_in,
      name: request.session.name,
      surname: request.session.surname
    };
    response.render("about", viewData);
  }
};

module.exports = about;
