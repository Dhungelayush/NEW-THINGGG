const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "home.html"));
});

router.get("/redirect", (req, res) => {
  res.redirect("/");
});

router.get("/view-order", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "view-order.html"));
});
router.get("/my-restaurants", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "manage-restaurant.html"));
});
  router.get("/verify-order", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "html", "verify-order.html"));
  });



module.exports = router;
