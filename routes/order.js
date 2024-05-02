const express = require("express");
const path = require("path");
const { getMenuItems } = require("../restaurantUtils");

const router = express.Router();

router.get("/orderFood", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "order.html"));
});

router.get("/orderPayment", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "order-payment.html"));
});

router.get("/menuItems/:restaurantName", (req, res) => {
  const restaurantName = req.params.restaurantName;
  const menuItems = getMenuItems(restaurantName);

  if (menuItems) {
    res.json({ menuItems });
  } else {
    res.status(404).json({ message: "Menu items not found" });
  }
});

module.exports = router;
