const express = require("express");
const router = express.Router();

const home = require("./controllers/home.js");
const about = require("./controllers/about.js");
const accounts = require("./controllers/accounts.js")
const profile = require("./controllers/profile.js")
const restaurant = require("./controllers/restaurant.js")
const dishes = require("./controllers/dishes.js")

router.get("/", home.index);
router.get("/about", about.index);

router.get("/signup", accounts.signup);
router.get("/login", accounts.login);
router.post("/register", accounts.register);
router.get("/logout", accounts.logout);
router.post("/authenticate", accounts.authenticate);

router.get("/profile", profile.index);
router.get("/profile_settings", profile.settings);
router.post("/change_profile_attributes", profile.change_attributes)

router.get("/restaurant/:id", restaurant.index);
router.get("/restaurant/:id/rate", restaurant.index);
router.post("/restaurant/:id/rate", restaurant.add_rating);
router.get("/restaurant/:restaurant_id/dish/:dish_id", dishes.index);
router.get("/restaurant/:restaurant_id/dish/:dish_id/rate", dishes.index);
router.post("/restaurant/:restaurant_id/dish/:dish_id/rate", dishes.add_rating);

module.exports = router;