const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/user-auth", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "user-auth.html"));
});

router.get("/callback", (req, res) => {
  res.redirect("/"); 
});

router.get("/logout", (req, res) => {
  req.logout(); 
  res.redirect("/");
});
module.exports = router;