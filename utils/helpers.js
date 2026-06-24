const handlebars = require("express-handlebars")

const helper = {
    get_stars(rating) {
        let rounded = (Math.round(2*rating))/2 //now rounded is either x.0 or x.5
        string = ""
        for (let i = 1; i<=5; ++i) {
            if (i<=rounded) string += '<i class="bi bi-star-fill"></i>';
            else if (i-0.5 === rounded) string += '<i class="bi bi-star-half"></i>';
            else string += '<i class="bi bi-star"></i>';
        }
        return string;
    },
    
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

module.exports = helper;