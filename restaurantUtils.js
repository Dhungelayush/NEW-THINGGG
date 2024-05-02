  const fs = require("fs");
  const path = require("path");
  const cloudinary = require("cloudinary").v2;
  const { insertRestaurantData } = require("./routes/db");

  const jsonFilePath = path.join(__dirname, "Server-data", "restaurant.json");
  const backupJsonFilePath = path.join(__dirname, "Server-data", "backupRestaurant.json");
  

  cloudinary.config({
    cloud_name: "dxdry321q",
    api_key: "694884547599971",
    api_secret: "EzpoyWggcY8Ln_eNgr4XeFz4mH8",
  });

  function readRestaurantData() {
    try {
      const data = fs.readFileSync(jsonFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON file:", error);
      return { areas: {} };
    }
  }

  function writeRestaurantData(data) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(jsonFilePath, jsonData, "utf8");
      console.log("Restaurant data updated successfully.");
    } catch (error) {
      console.error("Error writing JSON file:", error);
    }
  }

  async function uploadImageToCloudinary(imagePath) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        imagePath,
        { folder: "restaurant_images/" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  function backupRestaurantData() {
    try {
      const data = readRestaurantData();
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(backupJsonFilePath, jsonData, "utf8");
      console.log("Restaurant data backed up successfully.");
    } catch (error) {
      console.error("Error backing up restaurant data:", error);
    }
  }

  async function addRestaurant(req) {
    const { area, restaurantName, orderReceiveEmail, phoneNumber, menu, restaurantImage } = req.body;
    const uniqueFileName = `restaurant_${Date.now()}.png`;

    try {
      // Save the image to the server first
      const imagePath = path.join(__dirname, "uploads", uniqueFileName);
      await req.files.restaurantImage.mv(imagePath);

      console.log("Image saved:", imagePath);

      // Upload the image to Cloudinary
      const cloudinaryResult = await uploadImageToCloudinary(imagePath);

      // Delete the image from the server after uploading to Cloudinary
      fs.unlinkSync(imagePath);

      const newRestaurantData = {
        area,
        restaurantName,
        orderReceiveEmail,
        phoneNumber,
        menuItems: JSON.parse(menu),
        imageUrl: cloudinaryResult.secure_url, // Use the URL returned from Cloudinary
      };
      insertRestaurantData(newRestaurantData.orderReceiveEmail, newRestaurantData.area,newRestaurantData.restaurantName);
      const restaurants = readRestaurantData();

      if (!restaurants.areas[newRestaurantData.area]) {
        restaurants.areas[newRestaurantData.area] = [];
      }

      restaurants.areas[newRestaurantData.area].push({
        ...newRestaurantData,
      });

      writeRestaurantData(restaurants);

      return { message: "Restaurant added successfully" };
    } catch (error) {
      console.error("Error adding restaurant:", error);
      throw { message: "Error adding restaurant" };
    }
  }



  function getRestaurantsByArea(area) {
    const restaurantData = readRestaurantData();
    if (restaurantData.areas.hasOwnProperty(area)) {
      const restaurants = restaurantData.areas[area];
      return restaurants;
    } else {
      return [];
    }
  }
  async function editRestaurant(req) {
    try {
      // Get the data from the request
      const { area, restaurantName, orderReceiveEmail, phoneNumber, menu, restaurantImage } = req.body;
      const uniqueFileName = `restaurant_${Date.now()}.png`;
  
      // Save the image to the server first
      const imagePath = path.join(__dirname, "uploads", uniqueFileName);
      await req.files.restaurantImage.mv(imagePath);
      console.log("Image saved:", imagePath);
  
      // Upload the image to Cloudinary
      const cloudinaryResult = await uploadImageToCloudinary(imagePath);
  
      // Delete the image from the server after uploading to Cloudinary
      fs.unlinkSync(imagePath);
  
      const updatedRestaurantData = {
        area,
        restaurantName,
        orderReceiveEmail,
        phoneNumber,
        menuItems: JSON.parse(menu),
        imageUrl: cloudinaryResult.secure_url,
      };
  
      // Get all restaurants from the file
      const allRestaurants = getAllRestaurants();
  
      // Find the restaurant to be edited
      const restaurantIndex = allRestaurants.findIndex(
        (restaurant) => restaurant.area === area && restaurant.restaurantName === restaurantName
      );
  
      if (restaurantIndex !== -1) {
        // Update the restaurant data
        allRestaurants[restaurantIndex] = updatedRestaurantData;
  
        // Write the updated data to the file
        const updatedData = {
          areas: {
            [area]: allRestaurants,
          },
        };
        writeRestaurantData(updatedData);
  
        return { message: "Restaurant updated successfully" };
      } else {
        throw { message: "Restaurant not found" };
      }
    } catch (error) {
      console.error("Error editing restaurant:", error);
      throw { message: "Error editing restaurant" };
    }
  }
  
  // Function to delete a restaurant
  function deleteRestaurant(area, restaurantName) {
    try {
      // Get all restaurants from the file
      const allRestaurants = getAllRestaurants();
  
      // Find the restaurant to be deleted
      const restaurantIndex = allRestaurants.findIndex(
        (restaurant) => restaurant.area === area && restaurant.restaurantName === restaurantName
      );
  
      if (restaurantIndex !== -1) {
        // Remove the restaurant from the array
        allRestaurants.splice(restaurantIndex, 1);
  
        // Write the updated data to the file
        const updatedData = {
          areas: {
            [area]: allRestaurants,
          },
        };
        writeRestaurantData(updatedData);
  
        return { message: "Restaurant deleted successfully" };
      } else {
        throw { message: "Restaurant not found" };
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      throw { message: "Error deleting restaurant" };
    }
  }

  function getMenuItems(restaurantName) {
    const restaurants = getAllRestaurants();
    for (const restaurant of restaurants) {
      if (restaurant.restaurantName === restaurantName) {
        return restaurant.menuItems;
      }
    }
    return null;
  }

  function getAllRestaurants() {
    const restaurantData = readRestaurantData();
    const allRestaurants = [];
    for (const areaKey in restaurantData.areas) {
      allRestaurants.push(...restaurantData.areas[areaKey]);
    }
    return allRestaurants;
  }
  function getRestaurantsByOwnerEmail(email) {
    const allRestaurants = getAllRestaurants();
    const ownedRestaurants = allRestaurants.filter((restaurant) => restaurant.orderReceiveEmail === email);
    return ownedRestaurants;
  }

  module.exports = {
    addRestaurant,
    editRestaurant,
    deleteRestaurant,
    getRestaurantsByArea,
    getMenuItems,
    getAllRestaurants,
    getRestaurantsByOwnerEmail,
    backupRestaurantData,
  };