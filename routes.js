const express = require("express");
const router = express.Router();
const auth  = require("./utils/auth.js")

const index = require("./controllers/index.js");
const about = require("./controllers/about.js");
const accounts = require("./controllers/accounts.js")
const profile = require("./controllers/profile.js")
const restaurant = require("./controllers/restaurant.js")
const dishes = require("./controllers/dishes.js")
const search = require("./controllers/search.js")

router.get("/", index.index);
router.get("/about", about.index);

router.get("/signup", accounts.signup);
router.get("/login", accounts.login);
router.post("/register", accounts.register);
router.get("/logout", accounts.logout);
router.post("/authenticate", accounts.authenticate);

router.get("/profile", auth.protected, profile.index);
router.get("/profile_settings", auth.protected, profile.settings);
router.post("/change_profile_attributes", auth.protected, profile.change_attributes)

router.get("/restaurant/:id", restaurant.index);
router.get("/restaurant/:id/rate", auth.protected, restaurant.index);
router.get("/restaurant/:id/add_dish", auth.protected, restaurant.index);
router.post("/restaurant/:id/add_dish", auth.protected, restaurant.add_dish);
router.post("/restaurant/:id/rate", auth.protected, restaurant.add_rating);
router.get("/restaurant/:restaurant_id/user/:user_id/delete_rating", auth.protected, restaurant.delete_rating);

router.get("/restaurant/:restaurant_id/dish/:dish_id", dishes.index);
router.get("/restaurant/:restaurant_id/dish/:dish_id/rate", auth.protected, dishes.index);
router.post("/restaurant/:restaurant_id/dish/:dish_id/rate", auth.protected, dishes.add_rating);
router.get("/restaurant/:restaurant_id/dish/:dish_id/user/:user_id/delete_rating", auth.protected, dishes.delete_rating);

router.get("/add_restaurant", auth.protected, restaurant.add_restaurant);

router.get("/search", search.index);

module.exports = router;