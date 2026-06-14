const logger = require("./logger.js");

const controller_helper = {
    extract_keywords(keyword_list) { //gets a list of keyword strings and returns the string concatenated with ,
        let keyword_string = ""
        if (keyword_list !== undefined) {
            keyword_string = keyword_list[0];
            for (var i = 1, size = keyword_list.length; i<size; i++) {
                keyword_string += ", " + keyword_list[i];
            }
        }
        return keyword_string;
    }
}

module.exports = controller_helper