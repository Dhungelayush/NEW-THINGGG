const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const orderData = path.join(__dirname, "orderHistory.json");

router.get("/getOrderDetails/:area/:orderNumber", (req, res) => {
  const { area, orderNumber } = req.params;
  
  fs.readFile(orderData, "utf8", (err, jsonString) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).json({ error: "Error reading file" });
      return;
    }

    try {
      const orderHistory = JSON.parse(jsonString);

      if (orderHistory && orderHistory.orders && orderHistory.orders[area] && orderHistory.orders[area][orderNumber]) {
        const orderDetails = orderHistory.orders[area][orderNumber];
        res.json(orderDetails);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).json({ error: "Error parsing JSON data" });
    }
  });
});
router.post("/changeOrderStatus", (req, res) => {
  const { area, orderNumber } = req.body;

  fs.readFile(orderData, "utf8", (readErr, jsonString) => {
    if (readErr) {
      console.error("Error reading file:", readErr);
      res.status(500).json({ error: "Error reading file" });
      return;
    }

    try {
      const orderHistory = JSON.parse(jsonString);

      if (
        orderHistory &&
        orderHistory.orders &&
        orderHistory.orders[area] &&
        orderHistory.orders[area][orderNumber]
      ) {
        // Update the order status
        orderHistory.orders[area][orderNumber].orderStatus = "PROCESSING";

        // Write the updated data back to the file
        fs.writeFile(orderData, JSON.stringify(orderHistory, null, 2), (writeErr) => {
          if (writeErr) {
            console.error("Error writing file:", writeErr);
            res.status(500).json({ error: "Error writing file" });
          } else {
            res.json({ message: "Order status changed to PROCESSING" });
          }
        });
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).json({ error: "Error parsing JSON data" });
    }
  });
});


module.exports = router;
