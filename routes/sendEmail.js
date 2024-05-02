const express = require("express");
const { sendEmail } = require("../Server-data/emailSender");
const {AddDataToServer} = require("../Server-data/emailSender");

const router = express.Router();

router.post("/sendEmail", (req, res) => {
  const { receiver, topic, message } = req.body;

  // Call the sendEmail function from the emailSender module
  sendEmail(receiver, topic, message, (error, result) => {
    if (error) {
      res.status(500).json({ message: "Error sending email" });
    } else {
      res.json({ message: "Email sent successfully" });
    }
  });
});
router.post("/sendOrder", (req, res) => {
  const orderData = req.body;

  // Call the AddDataToServer function to save the order data to the JSON file
  AddDataToServer(orderData);
  res.json({ message: "Order received successfully!" });
});


module.exports = router;
