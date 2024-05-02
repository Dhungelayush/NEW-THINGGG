const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const fileUpload = require("express-fileupload");
const { auth } = require('express-openid-connect');

require('dotenv').config();

const homeRoutes = require("./routes/home");
const addRestaurantRoutes = require("./routes/addRestaurant");
const areasRoutes = require("./routes/areas");
const orderRoutes = require("./routes/order");
const sendEmailRoutes = require("./routes/sendEmail");
const userAuth = require("./routes/user-auth");
const orderUtilsRouter = require("./Server-data/order-utils");
const db = require("./routes/db")
const authRoutes = require("./routes/loginManager");


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, "static")));
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use(fileUpload());

app.use("/", homeRoutes);
app.use("/", addRestaurantRoutes);
app.use("/", areasRoutes);
app.use("/", orderRoutes);
app.use("/", sendEmailRoutes);
app.use("/", userAuth);
app.use("/", orderUtilsRouter); 
app.use("/", authRoutes);

const port = 3000;
app.listen(port, () => {
  console.log("Server started on port 3000");
});
