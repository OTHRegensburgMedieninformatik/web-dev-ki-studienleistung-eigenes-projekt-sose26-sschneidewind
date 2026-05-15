const express = require("express");
const logger = require("./utils/logger");
const helpers = require("./utils/helpers");
const handlebars = require("express-handlebars");
const session = require("express-session");
const bodyParser = require("body-parser");

const dotenv = require("dotenv");
dotenv.config();

const hbs = handlebars.create({
    extname: '.hbs',
    helpers: {
        stars: helpers.get_stars,
        and_not: function(a, b) {
            return a && !b;
        },
        or: function(a, b) {
            return a || b;
        },
        and: function(a, b) {
            return a && b;
        }
    }
});

const app = express();

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static("public"));

app.use(session({
    secret: "This is a secret!",
    cookie: {
        maxAge: 3600000
    },
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));

const routes = require("./routes");
app.use("/", routes);

app.listen(process.env.PORT, () => {
    console.log(`Web App template listening on ${process.env.PORT}`);
});

module.exports = app;
