const handlebars = require("express-handlebars")

const stars = {
    get_stars(rating) {
        let rounded = (Math.round(2*rating))/2 //now rounded is either x.0 or x.5
        string = ""
        for (let i = 1; i<=5; ++i) {
            if (i<=rounded) string += '<i class="bi bi-star-fill"></i>';
            else if (i-0.5 === rounded) string += '<i class="bi bi-star-half"></i>';
            else string += '<i class="bi bi-star"></i>';
        }
        return string;
    }
}

module.exports = stars;