const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const orderDatas = path.join(__dirname, "orderHistory.json");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dhungelayush96@gmail.com",
    pass: "pzqvfqbekahwywre",
  },
});

function sendEmail(receiver, topic, message, callback) {
  const mailOptions = {
    from: "dhungelayush96@gmail.com",
    to: receiver,
    subject: topic,
    html: message
  };
 
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      callback("Error sending email");
    } else {
      console.log("Email sent:", info.messageId);
      callback(null, "Email sent successfully");
    }
  });
}

function AddDataToServer(orderData) {
  try {
    fs.readFile(orderDatas, "utf8", (err, jsonString) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      let orderHistory = JSON.parse(jsonString);

      if (!orderHistory.orders) {
        orderHistory.orders = {};
      }

      const { area, orderNumber } = orderData;

      if (!orderHistory.orders[area]) {
        orderHistory.orders[area] = {};
      }

      orderHistory.orders[area][orderNumber] = orderData;

      fs.writeFile(orderDatas, JSON.stringify(orderHistory), "utf8", (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        } else {
          console.log("Data added to order history successfully.");
        }
      });
    });
  } catch (e) {
    console.error("Error reading file:", e);
  }
}


module.exports = { sendEmail,AddDataToServer };
