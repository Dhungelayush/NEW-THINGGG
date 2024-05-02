const express = require("express");
const { getRestaurantsByArea } = require("../restaurantUtils");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/areas", (req, res) => {
  const areasData = readAreasData();
  res.json(areasData);
});
function readAreasData() {
    try {
      const data = fs.readFileSync(path.join( "static", "area.json"), "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading areas JSON file:", error);
      return { areas: [] };
    }
  }

router.get("/restaurantsByArea/:area", (req, res) => {
  const area = req.params.area;
  const restaurants = getRestaurantsByArea(area);
  res.json(restaurants);
});

module.exports = router;
