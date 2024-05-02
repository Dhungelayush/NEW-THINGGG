const mongoose = require('mongoose');

// Replace <YOUR_MONGODB_URI> with your actual MongoDB connection string
const mongodbURI = "mongodb://prabesh:GZVTonhMilcJX50U@ac-hrouids-shard-00-00.vxdfkil.mongodb.net:27017,ac-hrouids-shard-00-01.vxdfkil.mongodb.net:27017,ac-hrouids-shard-00-02.vxdfkil.mongodb.net:27017/?ssl=true&replicaSet=atlas-6fc9bb-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(mongodbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;


db.on('connected', () => {
  console.log('Connected to MongoDB database.');
});


db.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB database.');
});

const userSchema = new mongoose.Schema({
  _id: String, // User's email will be used as the _id field
  restaurants: {
    type: Map,
    of: [String],
  },
});



async function insertRestaurantData(email, area, restaurantName) {
  try {
    const userCollection = db.collection(email);
    await userCollection.updateOne(
      { _id: email },
      { $push: { [`restaurants.${area}`]: restaurantName } },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error inserting restaurant data:", error);
    throw error;
  }
}
async function getUserOwnedRestaurants(email) {
  try {
    const userCollection = db.collection(email);
    const user = await userCollection.findOne({ _id: email });
    

    if (!user || !user.restaurants) {
      return [];
    }

    const userRestaurants = user.restaurants;
    const ownedRestaurants = [];

    for (const area in userRestaurants) {
      const restaurantsInArea = userRestaurants[area];
      ownedRestaurants.push({
        area: area,
        restaurants: restaurantsInArea.map(restaurant => ({ name: restaurant }))
      });
      console.log("Owned Restaurants ==== ", JSON.stringify(ownedRestaurants));
    }
    if (ownedRestaurants.length === 0) {
      return [];
    }

   
    return ownedRestaurants;
  } catch (error) {
    console.error('Error fetching user-owned restaurants:', error);
    throw error;
  }
}
async function deleteRestaurantDB(email, restaurantName) {
  try {
    const userCollection = db.collection(email);
    const user = await userCollection.findOne({ _id: email });

    if (!user || !user.restaurants) {
      return { success: false, message: 'Restaurant not found.' };
    }


    const updatedRestaurants = user.restaurants[email].filter(name => name !== restaurantName);

    const updateResult = await userCollection.updateOne(
      { _id: email },
      { $set: { [`restaurants.${email}`]: updatedRestaurants } }
    );

    if (updateResult.modifiedCount === 0) {
      return { success: false, message: 'Failed to delete restaurant.' };
    }

    return { success: true, message: 'Restaurant deleted successfully.' };
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
}



module.exports = {
  insertRestaurantData,
  getUserOwnedRestaurants,
  deleteRestaurantDB,
  db, 
};
