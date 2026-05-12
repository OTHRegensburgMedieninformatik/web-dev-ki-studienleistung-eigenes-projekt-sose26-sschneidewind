const express = require("express");
const router = express.Router();

const home = require("./controllers/home.js");
const about = require("./controllers/about.js");
const accounts = require("./controllers/accounts.js")
const profile = require("./controllers/profile.js")

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

module.exports = router;
