const express = require("express");
const path = require("path");
const { addRestaurant, editRestaurant, deleteRestaurant } = require("../restaurantUtils");
const { getUserOwnedRestaurants,deleteRestaurantDB } = require('./db');


const router = express.Router();

router.get("/addRestaurant", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "add-restaurant.html"));
});

router.post("/addRestaurant", async (req, res) => {
  if (req.body.menu == null || !req.files || !req.files.restaurantImage) {
    res.status(400).send({ message: "Missing required data in request body" });
    return;
  }

  try {
    const result = addRestaurant(req);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error adding restaurant:", error);
    res.status(500).send({ message: "Error adding restaurant" });
  }
});

router.post("/editRestaurant", async (req, res) => {
 console.log(req.body , "BODYY");
  if (req.body.menu == null || !req.files || !req.files.restaurantImage) {
    res.status(400).send({ message: "Missing required data in request body" });
    return;
  }

  try {
    const result = await editRestaurant(req);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error editing restaurant:", error);
    res.status(500).send({ message: "Error editing restaurant" });
  }
});

router.post("/deleteRestaurantDatabase", async (req, res) => {
  // You need to pass the necessary data in the request body to identify the restaurant to be deleted
  // For example, you can pass the area and restaurantName
  const { email, restaurantName } = req.body;

  try {
    const result = await deleteRestaurantDB(email, restaurantName);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).send({ message: "Error deleting restaurant" });
  }
});


router.post("/deleteRestaurant", async (req, res) => {
  // You need to pass the necessary data in the request body to identify the restaurant to be deleted
  // For example, you can pass the area and restaurantName
  const { area, restaurantName } = req.body;

  try {
    const result = await deleteRestaurant(area, restaurantName);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).send({ message: "Error deleting restaurant" });
  }
});


router.get('/userOwnedRestaurants/:email', async (req, res) => {
  const userEmail = req.params.email;
  console.log("User email =>" + userEmail);

  try {
    const ownedRestaurants = await getUserOwnedRestaurants(userEmail,"Birtamode");
    console.log("The Owned Restaurants  " + ownedRestaurants);
    res.json(ownedRestaurants);
  } catch (error) {
    console.error('Error fetching user-owned restaurants:', error);
    res.status(500).json({ error: 'Error fetching user-owned restaurants' });
  }
});


module.exports = router;
